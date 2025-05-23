import type { HttpContext } from '@adonisjs/core/http'
import StudentsService from '#services/student_service'
import { inject } from '@adonisjs/core'
import Student from '#models/student'
import { createUserValidator, updateUserValidator } from '#validators/user'
import {
  createClassStudentValidator,
  createStudentDetailValidator,
  createStudentValidator,
  updateClassStudentValidator,
  updateStudentDetailValidator,
  updateStudentValidator,
} from '#validators/student'
import { errors as lucidErrors } from '@adonisjs/lucid'

@inject()
export default class StudentsController {
  /**
   * Constructor
   * */
  constructor(private studentsService: StudentsService) {}

  async index({ request, response }: HttpContext) {
    try {
      const students = await this.studentsService.index(request.input('page', 1), request.all())
      return response.ok({
        messsage: 'Berhasil Mendapatkan Data Semua Murid',
        students,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const student = await this.studentsService.show(params.id)
      return response.ok({
        message: 'Murid Ditemukan',
        student,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Murid Tidak Ditemukan' } })
      return response.status(error.status).send({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const student = await this.studentsService.create(request.all())

      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('student_detail.profile_picture')

      if (profilePicture) {
        data.student_detail.profile_picture = profilePicture
      }

      await createUserValidator.validate(data.user)
      await createStudentValidator.validate(data.student)
      await createStudentDetailValidator.validate(data.student_detail)
      await createClassStudentValidator.validate(data.class_student)

      return response.created({
        message: 'Murid Berhasil Ditambahkan',
        student,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      console.log(request.all()) // Debug untuk data JSON
      console.log(request.file('student_detail.profile_picture')) // Debug untuk file

      if (!request.input('user') && !request.input('student') && !request.input('student_detail')) {
        return response.unprocessableEntity({
          error: {
            message: 'Field harus berada di dalam object user, student, dan student_detail',
          },
        })
      }

      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('student_detail.profile_picture')

      if (profilePicture) {
        data.student_detail.profile_picture = profilePicture
      }

      await updateUserValidator.validate(data.user)
      await updateStudentValidator.validate(data.student)
      await updateStudentDetailValidator.validate(data.student_detail)
      await updateClassStudentValidator.validate(data.class_student)

      const student = await this.studentsService.update(params.id, data)
      return response.ok({ message: 'Murid Berhasil Diupdate', student })
    } catch (error) {
      console.log(error)
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Murid Tidak Ditemukan' } })
      return response.unprocessableEntity({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const student = await this.studentsService.delete(params.id)

      return response.ok({ message: `Murid atas nama (${student}) Berhasil Dihapus!` })
    } catch (error) {
      if (error.code !== 'E_ROW_NOT_FOUND')
        return response.badRequest({ error: { message: error.message } })
      return response.notFound({ error: { message: 'ID Murid Tidak Ditemukan' } })
    }
  }

  /**
   * Mengambil data siswa dari pengguna yang sedang login.
   */
  async getStudent({ auth, response }: HttpContext) {
    try {
      const user = auth.user
      if (!user) {
        return response.unauthorized({ message: 'Unauthorized' })
      }
      const student = await this.studentsService.show(user.id)
      return response.ok({
        message: 'Data Siswa Berhasil Ditemukan',
        student,
      })
    } catch (error) {
      return error
    }
  }

  /**
   * Mengambil jadwal pelajaran berdasarkan studentId.
   */
  async getSchedule({ request, params, response }: HttpContext) {
    try {
      const schedule = await this.studentsService.getSchedule(params.studentId, request.all())
      return response.ok({
        message: 'Data Jadwal Berhasil Ditemukan',
        schedule,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   */
  async getPresence({ params, response }: HttpContext) {
    try {
      const presenceData = await this.studentsService.getPresence(params.studentId)
      return response.ok({
        message: 'Data Presensi Berhasil Ditemukan',
        presenceData,
      })
    } catch (error) {
      return error
    }
  }

  /**
   * Naik Kelas
   */
  async promoteClass({ request, response }: HttpContext) {
    try {
      const data = request.input('data')

      if (!Array.isArray(data.student_ids) || data.student_ids.length === 0) {
        return response.badRequest({ error: { message: 'Tidak ada siswa yang diproses' } })
      }

      const student = await this.studentsService.studentPromoted(data)

      return response.created({ message: 'Berhasil Naik Kelas', student })
    } catch (error) {
      if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        return response.notFound({
          error: { message: 'Record tidak ditemukan dalam database. Periksa Input Anda!' },
        })
      }
      return response.badRequest({ error: { message: error.message, status: error.status } })
    }
  }

  async cek({ response }: HttpContext) {
    const st = await Student.query().where('id', 45).firstOrFail()
    if (!st) {
      return response.status(404).send({ message: 'Data tidak ditemukan' })
    }
    return response.ok({ message: 'Berhasil', st })
  }
}
