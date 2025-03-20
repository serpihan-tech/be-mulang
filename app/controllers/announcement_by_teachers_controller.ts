import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AnnouncementByTeacherService } from '#services/announcement_by_teacher_service'

@inject()
export default class AnnouncementByTeachersController {
  constructor(private announcementService: AnnouncementByTeacherService) {}

  public async index({ request, response }: HttpContext) {
    try {
      const announcements = await this.announcementService.getAll(request.all())
      return {
        message: 'Pengumuman Berhasil Di Tampilkan',
        announcements,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.getOne(params.id)
      return {
        message: 'Pengumuman Berhasil Di Tampilkan',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.create(request.all())
      return {
        message: 'Pengumuman Berhasil Di Tambahkan',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.update(request.all(), params.id)
      return {
        message: 'Pengumuman Berhasil Di Ubah',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.delete(params.id)
      return {
        message: 'Pengumuman Berhasil Di Hapus',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
