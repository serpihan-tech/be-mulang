import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import TeacherService from '#services/teacher_service'
import { createUserValidator, updateUserValidator } from '#validators/user'
import { createTeacherValidator, updateTeacherValidator } from '#validators/teacher'

@inject()
export default class TeachersController {
  constructor(private teacherService: TeacherService) {}

  async index({ request, response }: HttpContext) {
    try {
      const teachers = await this.teacherService.index(
        request.all(),
        request.input('page', 1),
        request.input('limit')
      )
      return response.ok({
        messsage: 'Berhasil Mendapatkan Data Semua Guru',
        teachers,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const teacher = await this.teacherService.show(params.id)
      return response.ok({
        message: 'Berhasil Mendapatkan Data Guru',
        teacher,
      })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('teacher.profile_picture')

      if (profilePicture) {
        data.teacher.profile_picture = profilePicture
      }

      await createUserValidator.validate(data.user)
      await createTeacherValidator.validate(data.teacher)

      const teacher = await this.teacherService.create(data)

      return response.created({
        message: 'Guru Berhasil Ditambahkan',
        teacher,
      })
    } catch (error) {
      return response.unprocessableEntity({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()

      // Ambil file profile_picture dari request.file() secara terpisah
      const profilePicture = request.file('teacher.profile_picture')

      if (profilePicture) {
        data.teacher.profile_picture = profilePicture
      }

      await updateUserValidator.validate(data.user)
      await updateTeacherValidator.validate(data.teacher)

      const teacher = await this.teacherService.update(params.id, data)
      return response.ok({
        message: 'Data Guru Berhasil Diubah',
        teacher,
      })
    } catch (error) {
      // console.error(error)
      return response.unprocessableEntity({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.teacherService.delete(params.id)
      return response.ok({
        message: 'Guru Berhasil Dihapus',
      })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Guru Tidak Ditemukan' } })
    }
  }

  async getIdName({ response }: HttpContext) {
    try {
      const tc = await this.teacherService.getIdName()
      return response.ok({ message: 'Data Guru Berhasil Didapatkan', teachers: tc })
    } catch (error) {
      return response.status(error.code).send({ error: { message: error.message } })
    }
  }

  async getCountStudentsAndClasses({ auth, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()
      await user.load('teacher')

      const data = await this.teacherService.getCountStudentsAndClasses(user.teacher.id)
      return response.ok({ message: 'Data untuk Guru Berhasil Didapatkan', data })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
