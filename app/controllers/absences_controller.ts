import type { HttpContext } from '@adonisjs/core/http'
import { AbsenceService } from '#services/absence_service'
import { inject } from '@adonisjs/core'
import { updateAbsenceValidator } from '#validators/absence'

@inject()
export default class AbsencesController {
  constructor(private absenceService: AbsenceService) {}

  async index({ request, response }: HttpContext) {
    try {
      const absences = await this.absenceService.getAll(
        request.input('date'),
        request.input('page', 1)
      )

      return response.ok({
        message: 'Berhasil Mendapatkan Data Absensi',
        absences,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      await updateAbsenceValidator.validate(request.all())
      const absence = await this.absenceService.update(params.id, request.all())
      return response.ok({ message: 'Absensi Berhasil Diupdate', absence })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.absenceService.delete(params.id)
      return response.ok({ message: 'Absensi Berhasil Dihapus' })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Absensi Tidak Ditemukan' } })
    }
  }
}
