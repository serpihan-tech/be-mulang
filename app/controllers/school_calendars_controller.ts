import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { SchoolCalendarService } from '#services/school_calendar_service'
import { stores } from '@adonisjs/limiter'
import { createCalendarValidator, updateCalendarValidator } from '#validators/school_calendar'

@inject()
export default class SchoolCalendarsController {
  constructor(protected schoolCalendarService: SchoolCalendarService) {}

  async index({ request, response }: HttpContext) {
    try {
      const data = request.all()

      const schoolCalendars = await this.schoolCalendarService.getAll(data)
      return response.ok({ message: 'Kalender Sekolah Berhasil Ditemukan', schoolCalendars })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const schoolCalendar = await this.schoolCalendarService.getOne(params.id)
      return response.ok({ message: 'Kalender Sekolah Berhasil Ditemukan', schoolCalendar })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Kalender Sekolah Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      await createCalendarValidator.validate(data)
      await this.schoolCalendarService.create(data)
      return response.created({ message: 'Kalender Sekolah Berhasil Ditambahkan' })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()

      await updateCalendarValidator.validate(data)
      await this.schoolCalendarService.update(params.id, data)
      return response.ok({ message: 'Kalender Sekolah Berhasil Diubah' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Kalender Sekolah Tidak Ditemukan' } })
      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.schoolCalendarService.delete(params.id)
      return response.ok({ message: 'Kalender Sekolah Berhasil Dihapus' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Kalender Sekolah Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
