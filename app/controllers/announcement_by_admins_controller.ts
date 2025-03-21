import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AnnouncementByAdminService } from '#services/announcement_by_admin_service'
import User from '#models/user'
import { createAnnouncementAdmin, updateAnnouncementAdmin } from '#validators/announcement_admin'

@inject()
export default class AnnouncementByAdminsController {
  constructor(private announcementByAdmin: AnnouncementByAdminService) {}

  async getBoth({ request, response }: HttpContext) {
    try {
      const ann = await this.announcementByAdmin.getBothAll(request.all())
      return response.ok({
        message: 'Pengumuman Admin dan Guru Berhasil Dimuat!',
        announcements: ann,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async index({ auth, request, response }: HttpContext) {
    const user: User = auth.getUserOrFail()
    const role = await User.getRole(user)
    const page = request.input('page')
    const limit = request.input('limit')
    const data = request.all()

    try {
      console.log(role)
      const ann = await this.announcementByAdmin.getAll(page, limit, role.role, data, user)
      return response.ok({ message: 'Pengumuman Admin Berhasil Dimuat!', announcements: ann })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const announcement = await this.announcementByAdmin.getOne(params.id)
      return response.ok({ message: 'Data Pengumuman Berhasil Dimuat!', announcement })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'Pengumuman Admin Tidak Ditemukan!' } })
      return response.badRequest({ error })
    }
  }

  async store({ auth, request, response }: HttpContext) {
    const us = auth.getUserOrFail()
    await us.load('admin')

    if (!us.admin) {
      return response.forbidden({ error: { message: 'Anda Tidak Punya Akses!' } })
    }

    const adminId: number = us.admin.id
    console.log(adminId)

    try {
      const files = request.file('files')
      const data = request.all()

      if (files) data.files = files

      await createAnnouncementAdmin.validate(data)

      const announcement = await this.announcementByAdmin.create(data, adminId)
      return response.created({ message: 'Pengumuman Berhasil Dibuat!', announcement })
    } catch (error) {
      console.error(error)
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      console.log(request.file('files'))
      const files = request.file('files')
      const data = request.all()

      if (files) data.files = files

      await updateAnnouncementAdmin.validate(data)

      const announcement = await this.announcementByAdmin.update(params.id, data)
      return response.ok({ message: 'Data Pengumuman Berhasil Diubah!', announcement })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'Pengumuman Admin Tidak Ditemukan!' } })
      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.announcementByAdmin.delete(params.id)
      return response.ok({ message: 'Pengumuman Berhasil Dihapus!' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'Pengumuman Admin Tidak Ditemukan!' } })
      return response.badRequest({ error })
    }
  }
}
