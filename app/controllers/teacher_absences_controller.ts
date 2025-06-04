import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { TeacherAbsenceService } from '#services/teacher_absence_service'
import {
  createTeacherAbsenceValidator,
  updateTeacherAbsenceValidator,
} from '#validators/teacher_absence'
import User from '#models/user'
import { DateTime } from 'luxon'

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
      const inPhoto = request.file('in_photo')
      const outPhoto = request.file('out_photo')

      if (inPhoto) {
        data.in_photo = inPhoto
      }

      if (outPhoto) {
        data.out_photo = outPhoto
      }

      // console.log(data)
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
      const inPhoto = request.file('in_photo')
      const outPhoto = request.file('out_photo')

      if (inPhoto) {
        data.in_photo = inPhoto
      }

      if (outPhoto) {
        data.out_photo = outPhoto
      }

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

  async exportExcel({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('admin')

      const userRole = await User.getRole(user)
      if (userRole.role !== 'admin') {
        return response.forbidden({ error: { message: 'Anda Tidak Memiliki Akses Untuk Hal Ini' } })
      }

      const data = await this.teacherAbsenceService.downloadExcel(request.all(), user)
      const now = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyyMMdd_HHmmss')

      response.header(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
      response.header(
        'Content-Disposition',
        'attachment; filename="data_presensi_guru_' + now + '.xlsx"'
      )

      return response.send(data)
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
