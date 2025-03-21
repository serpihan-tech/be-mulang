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
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { DateTime } from 'luxon'

type AnnouncementQueryParams = {
  page?: number
  limit?: number
  search?: string
  sort?: 'asc' | 'desc'
}

type AnnouncementWithMadeBy = {
  id: number
  title: string
  content: string
  date: string
  category: string
  files: string
  madeBy: 'Admin' | 'Teacher'
  [key: string]: any
}

export class AnnouncementByAdminService
  implements AnnouncementByAdminContract, AnnouncementContract
{
  async getBothAll(params: AnnouncementQueryParams): Promise<{
    meta: {
      page: number
      limit: number
      total: number
      lastPage: number
    }
    data: AnnouncementWithMadeBy[]
  }> {
    const { page = 1, limit = 10, search = '', sort = 'desc' } = params

    // Query Admin
    const adminQuery = AnnouncementByAdmin.query()
    if (search) {
      adminQuery.where((query) => {
        query
          .whereILike('title', `%${search}%`)
          .orWhereILike('content', `%${search}%`)
          .orWhereILike('category', `%${search}%`)
      })
    }

    const annAdminRaw = await adminQuery.orderBy('date', sort)
    const annAdmin = annAdminRaw.map(
      (ann) =>
        ({
          ...ann.toJSON(),
          madeBy: 'Admin',
        }) as AnnouncementWithMadeBy
    )

    // Query Teacher
    const teacherQuery = AnnouncementByTeacher.query()
    if (search) {
      teacherQuery.where((query) => {
        query
          .whereILike('title', `%${search}%`)
          .orWhereILike('content', `%${search}%`)
          .orWhereILike('category', `%${search}%`)
      })
    }

    const annTeacherRaw = await teacherQuery.orderBy('date', sort)
    const annTeacher = annTeacherRaw.map(
      (ann) =>
        ({
          ...ann.toJSON(),
          madeBy: 'Teacher',
        }) as AnnouncementWithMadeBy
    )

    // Gabungkan & sortir ulang
    const allAnnouncements = [...annAdmin, ...annTeacher]

    const sorted = allAnnouncements.sort((a, b) => {
      const dateA = DateTime.fromISO(a.date)
      const dateB = DateTime.fromISO(b.date)
      return sort === 'asc'
        ? dateA.toMillis() - dateB.toMillis()
        : dateB.toMillis() - dateA.toMillis()
    })

    // Pagination manual
    const startIndex = (page - 1) * limit
    const paginated = sorted.slice(startIndex, startIndex + limit)

    return {
      meta: {
        page,
        limit,
        total: sorted.length,
        lastPage: Math.ceil(sorted.length / limit),
      },
      data: paginated,
    }
  }

  async getAll(page: number, limit?: number, role?: string, data?: any, user?: User): Promise<any> {
    const perPage: number = limit || 10

    let adminId: number | undefined
    if (role === 'admin' && user) {
      await user.load('admin')
      adminId = user.admin.id
    }

    const query = AnnouncementByAdmin.query() // TODO : Add filtering

    if (adminId !== undefined) {
      query.where('admin_id', adminId)
    } else {
      query.where('target_roles', `${role}`)
    }

    const announcement = await query.paginate(page, perPage)

    return announcement
  }

  async getOne(id: number): Promise<any> {
    const announcement = AnnouncementByAdmin.query().where('id', id).firstOrFail()

    return announcement
  }

  async create(data: any, adminId: number): Promise<Object> {
    const file = data.files
    // console.log(file)
    let filePath = ''

    if (file) {
      await file.move(app.tmpPath('storage/uploads/announcement-admins'), {
        name: `${new Date().getTime()}_${file.clientName}`,
        overwrite: true,
      })
      filePath = `${file.fileName}`
    }

    const ann = await AnnouncementByAdmin.create({
      title: data.title,
      content: data.content,
      category: data.category,
      adminId: adminId,
      date: new Date(),
      files: filePath,
      targetRoles: data.target_roles,
    })

    // const users = await User.query().whereHas('roles', (query) => {
    //   query.where('role', ann.target_roles)
    // })

    // for (const user of users) {
    //   console.log(`Mengirim notifikasi ke notifications/${user.id}`)

    //   transmit.broadcast(`notifications/${user.id}`, {
    //     message: {
    //       id: ann.id,
    //       title: ann.title,
    //       content: ann.content,
    //       category: ann.category,
    //       date: ann.date.toISOString(),
    //     },
    //   })
    // }
    console.log(ann.targetRoles)

    const admin = await Admin.query().where('id', adminId).firstOrFail()
    const role = await User.getRole(await admin.related('user').query().firstOrFail())

    const t = transmit.broadcast(`notifications/${ann.targetRoles}`, {
      message: {
        id: ann.id,
        title: ann.title,
        from: admin.name,
        role: role?.role,
        // file: ann.files,
        content: ann.content,
        category: ann.category,
        date: ann.date.toISOString(),
      },
    })

    console.log(t)
    return ann
  }

  async update(id: number, data: any): Promise<Object> {
    const announcement = await AnnouncementByAdmin.query().where('id', id).firstOrFail()
    // console.log(data)

    if (data.files) {
      const file = data.files
      const fileName = `${cuid()}.${data.files.extname}`

      await file.move(app.makePath('storage/uploads/announcement-admins'), {
        name: fileName,
      })

      data.files = `${fileName}`
    }

    announcement.merge({
      files: data.files,
      ...data,
    })
    await announcement.save()

    return announcement
  }

  async delete(id: number): Promise<void> {
    const announcement = await AnnouncementByAdmin.query().where('id', id).firstOrFail()
    await announcement.delete()
  }
}
