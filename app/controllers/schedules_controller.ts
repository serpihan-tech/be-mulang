import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ScheduleService } from '#services/schedule_service'
import { createScheduleValidator, updateScheduleValidator } from '#validators/schedule'

@inject()
export default class SchedulesController {
  constructor(protected scheduleService: ScheduleService) {}

  async index({ request, response }: HttpContext) {
    try {
      const schedules = await this.scheduleService.getAll(request.all())
      return response.ok({
        message: 'Jadwal Berhasil Ditemukan',
        schedules,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const schedule = await this.scheduleService.getOne(params.id)
      return response.ok({
        message: 'Jadwal Berhasil Ditemukan',
        schedule,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Jadwal Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      await createScheduleValidator.validate(request.all())
      const schedule = await this.scheduleService.create(request.all())
      return response.created({
        message: 'Jadwal Berhasil Ditambahkan',
        schedule,
      })
    } catch (error) {
      return response.unprocessableEntity({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      await updateScheduleValidator.validate(request.all())
      const schedule = await this.scheduleService.update(params.id, request.all())
      return response.ok({
        message: 'Jadwal Berhasil Diubah',
        schedule,
      })
    } catch (error) {
      return response.unprocessableEntity({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.scheduleService.delete(params.id)
      return response.ok({
        message: 'Jadwal Berhasil Dihapus',
      })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Jadwal Tidak Ditemukan' } })
    }
  }

  async teachersSchedule({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('teacher')
      const data = request.all()
      if (!user.teacher) {
        return response.badRequest({ error: { message: 'Data Guru Tidak Ditemukan' } })
      }

      // console.log('tecaher id di teachers schedule : ', user.teacher)
      const teachers = await this.scheduleService.TeachersSchedule(user.teacher.id, data)
      return response.ok({ message: 'Jadwal Berhasil Ditemukan', teachers })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
