import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AdminService } from '#services/admin_service'
import { createAdminValidator, updateAdminValidator } from '#validators/admin'
import { createUserValidator, updateUserValidator } from '#validators/user'

@inject()
export default class AdminsController {
  constructor(private adminService: AdminService) {}

  async index({ response }: HttpContext) {
    try {
      const admin = await this.adminService.getAll()
      return response.ok({ message: 'Admin Berhasil Ditampilkan', admin })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const admin = await this.adminService.getOne(params.id)
      return response.ok({ message: 'Admin Berhasil Ditampilkan', admin })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Admin Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('admin.profile_picture')

      if (profilePicture) {
        data.admin.profile_picture = profilePicture
      }

      await createUserValidator.validate(data.user)
      await createAdminValidator.validate(data.admin)

      const admin = await this.adminService.create(data)
      return response.created({ message: 'Admin Berhasil Ditambahkan', admin })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('admin.profile_picture')

      if (profilePicture) {
        data.admin.profile_picture = profilePicture
      }

      await updateUserValidator.validate(data.user)
      await updateAdminValidator.validate(data.admin)

      const admin = await this.adminService.update(params.id, data)
      return response.ok({ message: 'Admin Berhasil Diubah', admin })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Admin Tidak Ditemukan' } })
      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.adminService.delete(params.id)
      return response.ok({ message: 'Admin Berhasil Dihapus' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Admin Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
