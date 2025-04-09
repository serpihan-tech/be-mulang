import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { TeacherAbsenceService } from '#services/teacher_absence_service'
import {
  createTeacherAbsenceValidator,
  updateTeacherAbsenceValidator,
} from '#validators/teacher_absence'
import User from '#models/user'

@inject()
export default class TeacherAbsencesController {
  constructor(private teacherAbsenceService: TeacherAbsenceService) {}

  async index({ request, response }: HttpContext) {
    try {
      const data = request.all()
      const teachers = await this.teacherAbsenceService.getAll(data)

      return response.ok({ message: 'Data Absensi Guru Berhasil Ditemukan!', teachers })
    } catch (error) {
      return response.internalServerError({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const teacherAbsence = await this.teacherAbsenceService.getOne(params.id)

      return response.ok({
        message: 'Data Absensi Guru Berhasil Ditemukan!',
        teacherAbsence: teacherAbsence,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Absensi Guru Tidak Ditemukan' } })
      return response.internalServerError({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      await createTeacherAbsenceValidator.validate(data)

      const teacherAbsence = await this.teacherAbsenceService.create(data)

      return response.created({
        message: 'Absensi Guru Berhasil Dibuat!',
        teacherAbsence: teacherAbsence,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') return response.status(error.status).send({ error })
      return response.internalServerError({ error: { message: error.message } })
    }
  }

  async update({ request, params, response }: HttpContext) {
    try {
      const data = request.all()

      await updateTeacherAbsenceValidator.validate(data)
      const teacherAbsence = await this.teacherAbsenceService.update(params.id, data)

      return response.ok({
        message: 'Data Absensi Guru Berhasil Diubah',
        teacherAbsence: teacherAbsence,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Absensi Guru Tidak Ditemukan' } })
      else if (error.code === 'E_VALIDATION_ERROR')
        return response.status(error.status).send({ error })
      return response.internalServerError({ error: { message: error.message } })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.teacherAbsenceService.delete(params.id)

      return response.ok({ message: 'Data Absensi Guru Berhasil Dihapus' })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Absensi Guru Tidak Ditemukan' } })
      return response.internalServerError({ error: { message: error.message } })
    }
  }

  async getMineToday({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('teacher')

      if (!user.teacher) {
        return response.badRequest({ error: { message: 'Data Guru Tidak Ditemukan' } })
      }

      const teacherAbsence = await this.teacherAbsenceService.presenceToday(user.teacher.id)

      return response.ok({ message: 'Sukses Mendapatkan Data Absensi', teacherAbsence })
    } catch (error) {
      return response.internalServerError({ error: { message: error.message } })
    }
  }
}
