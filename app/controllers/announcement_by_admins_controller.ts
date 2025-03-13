import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AnnouncementByAdminService } from '#services/announcement_by_admin_service'
import AnnouncementByAdmin from '#models/announcement_by_admin'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import transmit from '@adonisjs/transmit/services/main'
import User from '#models/user'

@inject()
export default class AnnouncementByAdminsController {
  constructor(private announcementByAdmin: AnnouncementByAdminService) {}

  async test({ auth, request, response }: HttpContext) {
    const us = auth.user!
    await us.load('admin')
    const admin = await us.admin.id
    console.log(admin)
    try {
      const file = request.file('files', {
        size: '5mb',
        extnames: ['jpg', 'png', 'pdf', 'docx'],
      })

      let filePath = ''

      if (file) {
        await file.move(app.tmpPath('uploads'), {
          name: `${new Date().getTime()}_${file.clientName}`,
          overwrite: true,
        })
        filePath = `storage/uploads/${file.fileName}`
      }

      const ann = await AnnouncementByAdmin.create({
        title: 'Test Announcement', // Hardcoded
        content: 'This is a test announcement. RISPEEKKKKKKKK', // Hardcoded
        category: 'Prestasi', // Hardcoded
        admin_id: auth.user!.admin.id, // Dari user yang login
        date: new Date(), // Hardcoded
        files: filePath, // Input dari request
        target_roles: 'student', // Hardcoded
      })

      const users = await User.query().whereHas('roles', (query) => {
        query.where('role', ann.target_roles)
      })

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

      transmit.broadcast(`notifications/${ann.target_roles}`, {
        message: {
          id: ann.id,
          title: ann.title,
          content: ann.content,
          category: ann.category,
          date: ann.date.toISOString(),
        },
      })

      return response.ok({ ann })
    } catch (error) {
      console.error(error)
      return response.status(error.code).send(error)
    }
  }

  async list({ response }: HttpContext) {
    try {
      const ann = await AnnouncementByAdmin.query().where('target_roles', 'student')
      return response.ok({ ann })
    } catch (error) {
      console.error(error)
    }
  }
}
