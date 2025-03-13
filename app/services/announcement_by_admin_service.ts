// import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import transmit from '@adonisjs/transmit/services/main'
import AnnouncementByAdmin from '#models/announcement_by_admin'
import { AnnouncementByAdminContract } from '../contracts/announcement_contract.js'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'

export class AnnouncementByAdminService implements AnnouncementByAdminContract {
  async getAll(page: number, limit?: number, role?: string, data?: any, user?: User): Promise<any> {
    const perPage: number = limit || 10

    let adminId: number | undefined
    if (role === 'admin' && user) {
      await user.load('admin')
      adminId = user.admin.id
    }

    const query = AnnouncementByAdmin.filter(data)

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
    console.log(file)
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
      admin_id: adminId,
      date: new Date(),
      files: filePath,
      target_roles: data.target_roles,
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
    console.log(ann.target_roles)

    transmit.broadcast(`notifications/${ann.target_roles}`, {
      message: {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        category: ann.category,
        date: ann.date.toISOString(),
      },
    })

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
