import type { HttpContext } from '@adonisjs/core/http'
import { AbsenceService } from '#services/absence_service'
import { inject } from '@adonisjs/core'
import {
  createAbsenceValidator,
  massCreateAbsencesValidator,
  updateAbsenceValidator,
} from '#validators/absence'

@inject()
export default class AbsencesController {
  constructor(private absenceService: AbsenceService) {}

  async index({ request, response }: HttpContext) {
    try {
      const absences = await this.absenceService.getAll(request.all())

      return response.ok({
        message: 'Berhasil Mendapatkan Data Absensi',
        absences,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const absence = await this.absenceService.getById(params.id)
      return response.ok({ message: 'Absensi Berhasil Ditemukan', absence })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Absensi Tidak Ditemukan' } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      await createAbsenceValidator.validate(data)

      const absence = await this.absenceService.create(data)
      return response.created({ message: 'Absensi Berhasil Ditambahkan', absence })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()

      await updateAbsenceValidator.validate(data)

      const absence = await this.absenceService.update(params.id, data)
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

  async getMyAbsences({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('student')

      console.log(user)

      if (!user.student) {
        return response.badRequest({ error: { message: 'Data Siswa Tidak Ditemukan' } })
      }
      console.log('user.student.id :::: ', user.student.id)
      const st = await this.absenceService.getByStudentId(user.student.id)
      return response.ok({ message: 'Rekap Absensi Berhasil Ditemukan', studentsPresence: st })
    } catch (error) {
      return response.status(error.code).send({ error })
    }
  }

  async getAbsencesBySchedule({ params, response }: HttpContext) {
    try {
      const scheduleId = params.scheduleId
      const studentId = params.studentId

      const absences = await this.absenceService.getAbsencesBySchedule(scheduleId, studentId)

      return response.ok({ message: 'Absensi Berhasil Ditemukan', absences })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'Data Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async getAbsencesByModule({ params, response }: HttpContext) {
    try {
      const moduleId = params.moduleId
      const classId = params.classId

      const absences = await this.absenceService.getAbsencesByModule(moduleId, classId)

      return response.ok({ message: 'Absensi Berhasil Ditemukan', absences })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'Data Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async massAbsences({ request, response }: HttpContext) {
    try {
      const data = request.all()
      // console.log('data mass absences : \n', data)
      await massCreateAbsencesValidator.validate(data)

      const absences = await this.absenceService.massAbsences(data)
      return response.ok({ message: 'Absensi Berhasil Ditambahkan', absences })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
