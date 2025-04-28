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

  // async getBothAll(params: any): Promise<{
  //   meta: {
  //     total: number
  //     perPage: number
  //     currentPage: number
  //     lastPage: number
  //     firstPage: number
  //     firstPageUrl: string
  //     lastPageUrl: string
  //     nextPageUrl: string | null
  //     previousPageUrl: string | null
  //   }
  //   data: AnnouncementWithMadeBy[]
  // }> {
  //   const page = Number(params.page) || 1
  //   const limit = Number(params.limit) || 10
  //   const search = params.search || ''
  //   const sort = params.sort || 'desc'
  //   const sortBy = params.sortBy || 'date'
  //   const filterDate = params.filterDate || ''
  //   const startDate = params.startDate || ''
  //   const endDate = params.endDate || ''

  //   // Pastikan `madeBy` dan `category` bisa menerima banyak nilai
  //   const madeByFilter = Array.isArray(params.madeBy)
  //     ? params.madeBy
  //     : params.madeBy
  //       ? [params.madeBy]
  //       : ['Admin', 'Teacher']
  //   const categoryFilter = Array.isArray(params.category)
  //     ? params.category
  //     : params.category
  //       ? [params.category]
  //       : []

  //   let annAdmin: AnnouncementWithMadeBy[] = []
  //   if (madeByFilter.includes('Admin')) {
  //     const adminQuery = AnnouncementByAdmin.query()

  //     if (categoryFilter.length > 0) {
  //       adminQuery.whereIn('category', categoryFilter)
  //     }

  //     if (search) {
  //       adminQuery.where((query) => {
  //         query
  //           .whereILike('title', `%${search}%`)
  //           .orWhereILike('content', `%${search}%`)
  //           .orWhereILike('category', `%${search}%`)
  //       })
  //     }

  //     if (filterDate) {
  //       adminQuery.where('date', filterDate)
  //     } else if (startDate && endDate) {
  //       adminQuery.whereBetween('date', [startDate, endDate])
  //     }

  //     const adminData = await adminQuery.orderBy(sortBy, sort)
  //     annAdmin = adminData.map((ann) => ({
  //       ...(ann.toJSON() as AnnouncementWithMadeBy), // Pastikan semua field tetap ada
  //       madeBy: 'Admin',
  //     }))
  //   }

  //   let annTeacher: AnnouncementWithMadeBy[] = []
  //   if (madeByFilter.includes('Teacher')) {
  //     const teacherQuery = AnnouncementByTeacher.query()

  //     if (categoryFilter.length > 0) {
  //       teacherQuery.whereIn('category', categoryFilter)
  //     }

  //     if (search) {
  //       teacherQuery.where((query) => {
  //         query
  //           .whereILike('title', `%${search}%`)
  //           .orWhereILike('content', `%${search}%`)
  //           .orWhereILike('category', `%${search}%`)
  //       })
  //     }

  //     if (filterDate) {
  //       teacherQuery.where('date', filterDate)
  //     } else if (startDate && endDate) {
  //       teacherQuery.whereBetween('date', [startDate, endDate])
  //     }

  //     const teacherData = await teacherQuery.orderBy(sortBy, sort)
  //     annTeacher = teacherData.map((ann) => ({
  //       ...(ann.toJSON() as AnnouncementWithMadeBy), // Pastikan semua field tetap ada
  //       madeBy: 'Teacher',
  //     }))
  //   }

  //   const allAnnouncements = [...annAdmin, ...annTeacher].sort((a, b) => {
  //     if (sortBy === 'date') {
  //       const dateA = DateTime.fromISO(a.date)
  //       const dateB = DateTime.fromISO(b.date)
  //       return sort === 'asc'
  //         ? dateA.toMillis() - dateB.toMillis()
  //         : dateB.toMillis() - dateA.toMillis()
  //     } else {
  //       return sort === 'asc'
  //         ? a[sortBy].localeCompare(b[sortBy])
  //         : b[sortBy].localeCompare(a[sortBy])
  //     }
  //   })

  //   const total = allAnnouncements.length
  //   const lastPage = Math.ceil(total / limit)
  //   const paginated = allAnnouncements.slice((page - 1) * limit, page * limit)

  //   const baseUrl = `/?page=`
  //   const firstPage = 1
  //   const firstPageUrl = `${baseUrl}${firstPage}`
  //   const lastPageUrl = `${baseUrl}${lastPage}`
  //   const nextPageUrl = page < lastPage ? `${baseUrl}${page + 1}` : null
  //   const previousPageUrl = page > 1 ? `${baseUrl}${page - 1}` : null

  //   return {
  //     meta: {
  //       total,
  //       perPage: limit,
  //       currentPage: page,
  //       lastPage,
  //       firstPage,
  //       firstPageUrl,
  //       lastPageUrl,
  //       nextPageUrl,
  //       previousPageUrl,
  //     },
  //     data: paginated,
  //   }
  // }

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
      await file.move(app.makePath('storage/uploads/announcement-admins'), {
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
      date: data.date,
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

    if (ann.date.toISOString() === this.now) {
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
    }

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
