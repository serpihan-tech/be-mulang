// import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import transmit from '@adonisjs/transmit/services/main'
import AnnouncementByAdmin from '#models/announcement_by_admin'
import {
  AnnouncementByAdminContract,
  AnnouncementContract,
} from '../contracts/announcement_contract.js'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import Admin from '#models/admin'
// import AnnouncementByTeacher from '#models/announcement_by_teacher'
// import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

// type AnnouncementQueryParams = {
//   page?: number
//   limit?: number
//   search?: string
//   sort?: 'asc' | 'desc'
// }

// type AnnouncementWithMadeBy = {
//   id: number
//   title: string
//   content: string
//   date: string
//   category: string
//   files: string
//   madeBy: 'Admin' | 'Teacher'
//   [key: string]: any
// }

export class AnnouncementByAdminService
  implements AnnouncementByAdminContract, AnnouncementContract
{
  protected now =
    DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  async getBothAll(params: any): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'desc',
      sortBy = 'date',
      madeBy = [],
      category = [],
      date = '',
    } = params

    let subQuery = db
      .from('announcement_by_admins')
      .select('id', 'title', 'content', 'date', 'category', 'files', db.raw(`'Admin' as madeBy`))
      .unionAll([
        db
          .from('announcement_by_teachers')
          .select(
            'id',
            'title',
            'content',
            'date',
            'category',
            'files',
            db.raw(`'Teacher' as madeBy`)
          ),
      ])
      .as('subQuery')

    let query = db.from(subQuery).select('*')

    // Filter berdasarkan search (Title / Content)
    if (search) {
      query.where((qb) => {
        qb.where('title', 'like', `%${search}%`).orWhere('content', 'like', `%${search}%`)
      })
    }

    // Filter berdasarkan madeBy (Admin/Teacher)
    if (Array.isArray(madeBy) && madeBy.length > 0) {
      query.whereIn('madeBy', madeBy)
    }

    // Filter berdasarkan kategori
    if (Array.isArray(category) && category.length > 0) {
      query.whereIn('category', category)
    }

    // Filter berdasarkan tanggal
    if (date) {
      query.where('date', '=', date)
    }
    // if (endDate) {
    //   query.where('date', '<=', endDate)
    // }

    // Sorting
    query.orderBy(sortBy, sortOrder)

    return query.paginate(page, limit)
  }

  async getAll(page: number, limit?: number, role?: string, data?: any, user?: User): Promise<any> {
    const perPage: number = limit || 10

    let adminId: number | undefined
    if (role === 'admin' && user) {
      await user.load('admin')
      adminId = user.admin.id
    }

    const query = AnnouncementByAdmin.query().preload('admin', (admin) => admin.preload('user'))

    if (adminId !== undefined) {
      query.where('admin_id', adminId)
    } else {
      query.where('target_roles', `${role}`)
    }

    if (data?.noPaginate) {
      const announcements = await query.orderBy('date', 'desc')

      const results = await Promise.all(
        announcements.map(async (ann) => {
          const admin = ann.admin
          const userAdmin = admin?.user
          const roleName = userAdmin ? await User.getRole(userAdmin) : null

          return {
            id: ann.id,
            title: ann.title,
            from: admin?.name,
            role: roleName?.role,
            files: ann.files,
            content: ann.content,
            category: ann.category,
            date: ann.date.toISOString(),
            senderPicture: admin?.profilePicture,
          }
        })
      )

      return results
    }

    // Default paginate
    const announcement = await query.paginate(page, perPage)

    return announcement
  }

  async getOne(id: number): Promise<any> {
    const announcement = AnnouncementByAdmin.query().where('id', id).firstOrFail()

    return announcement
  }

  async create(data: any, adminId: number): Promise<Object> {
    const trx = await db.transaction()

    const file = data.files
    let filePath = ''
    let tempFilePath = ''

    try {
      if (file) {
        filePath = `announcement-admins/${new Date().getTime()}_${file.clientName}`
        tempFilePath = `${new Date().getTime()}_${file.clientName}`
      }

      const ann = await AnnouncementByAdmin.create(
        {
          title: data.title,
          content: data.content,
          category: data.category,
          adminId: adminId,
          date: data.date,
          files: filePath,
          targetRoles: data.target_roles,
        },
        { client: trx }
      )

      await trx.commit()

      // Setelah commit, baru move file
      if (file) {
        await file.move(app.makePath('storage/uploads/announcement-admins'), {
          name: tempFilePath,
          overwrite: true,
        })
      }

      const admin = await Admin.query().where('id', adminId).firstOrFail()
      const role = await User.getRole(await admin.related('user').query().firstOrFail())

      const annDate = new Date(ann.date)

      if (annDate.toISOString() === this.now) {
        transmit.broadcast(`notifications/${ann.targetRoles}`, {
          message: {
            id: ann.id,
            title: ann.title,
            from: admin.name,
            role: role?.role,
            files: ann.files,
            content: ann.content,
            category: ann.category,
            date: annDate.toISOString(),
            senderPicture: admin.profilePicture,
          },
        })
      }

      return ann
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(id: number, data: any): Promise<Object> {
    const trx = await db.transaction()
    const file = data.files
    let filePath = ''
    let tempFilePath = ''

    try {
      const announcement = await AnnouncementByAdmin.findOrFail(id)

      if (file) {
        filePath = `announcement-admins/${new Date().getTime()}_${file.clientName}`
        tempFilePath = `${new Date().getTime()}_${file.clientName}`

        announcement.merge({
          ...data,
          files: filePath, // Update file path
        })
      } else {
        announcement.merge(data)
      }

      await announcement.useTransaction(trx).save()
      await trx.commit()

      // Setelah commit, move file
      if (file) {
        await file.move(app.makePath('storage/uploads/announcement-admins'), {
          name: tempFilePath,
          overwrite: true,
        })
      }

      return announcement
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number): Promise<void> {
    const announcement = await AnnouncementByAdmin.query().where('id', id).firstOrFail()
    await announcement.delete()
  }
}
