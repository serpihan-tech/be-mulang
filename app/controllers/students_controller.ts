import type { HttpContext } from '@adonisjs/core/http'
import StudentsService from '#services/student_service'
import { inject } from '@adonisjs/core'
import Student from '#models/student'

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
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const student = await this.studentsService.create(request.all())
      return response.created({
        message: 'Murid Berhasil Ditambahkan',
        student,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const student = await this.studentsService.update(params.id, request.all())
      return response.ok(student)
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const student = await Student.query().where('id', params.id).preload('user').firstOrFail()
      const name = student.name ?? 'Tidak diketahui'
      await this.studentsService.delete(student.user)

      return response.ok({ message: `Murid atas nama (${name}) Berhasil Dihapus!` })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  /**
   * Mengambil data siswa dari pengguna yang sedang login.
   */
  async getStudent({ auth, response }: HttpContext) {
    const user = auth.user
    if (!user) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const student = await this.studentsService.show(user.id)
    return response.ok(student)
  }

  /**
   * Mengambil jadwal pelajaran berdasarkan studentId.
   */
  async getSchedule({ params, response }: HttpContext) {
    try {
      const schedule = await this.studentsService.getSchedule(params.studentId)
      return response.ok(schedule)
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   */
  async getPresence({ params, response }: HttpContext) {
    const presenceData = await this.studentsService.getPresence(params.studentId)
    return response.ok(presenceData)
  }
}
