import type { HttpContext } from '@adonisjs/core/http'
import StudentsService from '#services/student_service'
import { inject } from '@adonisjs/core'
import Student from '#models/student'
import { createUserValidator, updateUserValidator } from '#validators/user'
import {
  createStudentDetailValidator,
  createStudentValidator,
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

  async index(ctx: HttpContext) {
    try {
      const students = await this.studentsService.index(ctx.request.input('page', 1))
      return ctx.response.ok({
        messsage: 'Berhasil Mendapatkan Data Semua Murid',
        students,
      })
    } catch (error) {
      return ctx.response.badRequest({ error: { message: error.message } })
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
      await createUserValidator.validate(request.input('user'))
      await createStudentValidator.validate(request.input('student'))
      await createStudentDetailValidator.validate(request.input('student_detail'))

      const student = await this.studentsService.create(request.all())
      return response.created({
        message: 'Murid Berhasil Ditambahkan',
        student,
      })
    } catch (error) {
      return response.status(error.status).send({ error })
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

      await updateUserValidator.validate(request.input('user'))
      await updateStudentValidator.validate(request.input('student'))
      await updateStudentDetailValidator.validate(request.input('student_detail'))

      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('student_detail.profile_picture')

      if (profilePicture) {
        data.student_detail.profile_picture = profilePicture
      }

      const student = await this.studentsService.update(params.id, data)
      return response.ok({ message: 'Murid Berhasil Diupdate', student })
    } catch (error) {
      console.log(error)
      return response.unprocessableEntity({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const student = await this.studentsService.delete(params.id)

      return response.ok({ message: `Murid atas nama (${student?.name}) Berhasil Dihapus!` })
    } catch (error) {
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
  async getSchedule({ params, response }: HttpContext) {
    try {
      const schedule = await this.studentsService.getSchedule(params.studentId)
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

      if (!Array.isArray(data) || data.length === 0) {
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
