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
    DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd 00:00:00.000 +07:00') ?? // DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  async getBothAll(params: any): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'desc',
      sortBy = 'date',
      dibuatOleh = [],
      kategori = [],
      date = '',
    } = params

    const subQuery = db
      .from('announcement_by_admins')
      .select(
        'id',
        'title',
        'content',
        'date',
        'category',
        'files',
        'target_roles',
        db.raw('NULL as class_id'),
        db.raw('NULL as module_id'),
        db.raw(`'Admin' as madeBy`),
        db.raw('NULL as teacher_name')
      )
      .unionAll([
        db
          .from('announcement_by_teachers')
          .leftJoin('teachers', 'announcement_by_teachers.teacher_id', 'teachers.id')
          .select(
            'announcement_by_teachers.id',
            'announcement_by_teachers.title',
            'announcement_by_teachers.content',
            'announcement_by_teachers.date',
            'announcement_by_teachers.category',
            'announcement_by_teachers.files',
            db.raw('NULL as target_roles'),
            'announcement_by_teachers.class_id',
            'announcement_by_teachers.module_id',
            db.raw(`'Teacher' as madeBy`),
            'teachers.name as teacher_name'
          ),
      ])
      .as('subQuery')

    let query = db.from(subQuery).select('*')

    // Filtering
    if (search) {
      query.where((qb) => {
        qb.where('title', 'like', `%${search}%`).orWhere('content', 'like', `%${search}%`)
      })
    }

    // console.log('dibuatOleh', madeBy)
    if (Array.isArray(dibuatOleh) && dibuatOleh.length > 0) {
      query.whereIn('madeBy', dibuatOleh)
    }

    if (Array.isArray(kategori) && kategori.length > 0) {
      query.whereIn('category', kategori)
    }

    if (date) {
      query.where('date', '=', date)
    }

    switch (sortBy) {
      case 'tanggal':
        query.orderBy('date', sortOrder)
        break
      case 'judul':
        query.orderBy('title', sortOrder)
        break
      case 'deskripsi':
        query.orderBy('content', sortOrder)
        break
      case 'kategori':
        query.orderBy('category', sortOrder)
        break
      case 'dibuatOleh':
        query.orderBy('madeBy', sortOrder)
        break
      default:
        query.orderBy('date', sortOrder)
        break
    }

    return await query.paginate(page, limit)
  }

  async getAll(page: number, limit?: number, role?: string, data?: any, user?: User): Promise<any> {
    const perPage: number = limit || 10

    let adminId: number | undefined
    if (role === 'admin' && user) {
      await user.load('admin')
      adminId = user.admin.id
    }

    const query = AnnouncementByAdmin.query()
      .where('date', '<=', this.now)
      .preload('admin', (admin) => admin.preload('user'))

    if (adminId !== undefined) {
      query.where('admin_id', adminId)
    } else {
      query.where('target_roles', `${role}`)
    }

    if (data?.noPaginate) {
      const announcements = await query.orderBy('date', 'desc').orderBy('created_at', 'desc')

      const results = await Promise.all(
        announcements.map(async (ann) => {
          const admin = ann.admin
          const userAdmin = admin?.user
          const roleName = userAdmin ? await User.getRole(userAdmin) : null

          return {
            id: `44${ann.id}`,
            title: ann.title,
            from: admin?.name,
            role: roleName?.role,
            files: ann.files,
            content: ann.content,
            category: ann.category,
            date: ann.date.toISOString(),
            senderPicture: admin?.profilePicture,
            senderEmail: userAdmin.email,
            createdAt: ann.createdAt.toString(),
            updatedAt: ann.updatedAt.toString(),
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

  async create(data: any, adminId: number): Promise<Object | undefined> {
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

      if (file) {
        await file.move(app.makePath('storage/uploads/announcement-admins'), {
          name: tempFilePath,
          overwrite: true,
        })
      }

      const admin = await Admin.query().where('id', adminId).preload('user').firstOrFail()
      const role = await User.getRole(await admin.related('user').query().firstOrFail())

      const annDate = DateTime.fromISO(ann.date.toString()).setZone('Asia/Jakarta').toSQL()

      console.log('annDate : ', annDate, 'this.now : ', this.now)
      if (annDate === this.now) {
        transmit.broadcast(`notifications/${ann.targetRoles}`, {
          message: {
            id: `44${ann.id}`,
            title: ann.title,
            from: admin.name,
            role: role?.role,
            files: ann.files,
            content: ann.content,
            category: ann.category,
            date: ann.date.toString(),
            senderPicture: admin.profilePicture,
            senderEmail: admin.user.email,
            createdAt: ann.createdAt.toString(),
            updatedAt: ann.updatedAt.toString(),
          },
        })
      } else {
        return ann
      }
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
          files: filePath,
        })
      } else {
        announcement.merge(data)
      }

      await announcement.useTransaction(trx).save()
      await trx.commit()

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
