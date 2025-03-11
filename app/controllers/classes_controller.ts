import { createClassValidator, updateClassValidator } from '#validators/class'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ClassService } from '#services/class_service'

@inject()
export default class ClassesController {
  constructor(private classService: ClassService) {}
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 2)
    try {
      const classes = await this.classService.get(page, limit)

      return response.ok({
        status: true,
        code: 200,
        data: classes,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async create({}: HttpContext) {}

  async store({ request, response }: HttpContext) {
    try {
      await createClassValidator.validate(request.all())
      const classes = await this.classService.create(request.all())
      return response.created({
        message: 'Kelas Berhasil Ditambahkan',
        data: classes,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async show({ params, response, request }: HttpContext) {
    const classId: number = params.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 2)
    try {
      const classes = await this.classService.get(page, limit, classId)
      return response.ok({
        messages: 'berhasil ditampilkan',
        data: classes,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async edit({}: HttpContext) {}

  async update({ params, request, response }: HttpContext) {
    const classId: number = params.id
    try {
      await updateClassValidator.validate({
        name: request.input('name'),
        teacher_id: request.input('teacher_id'),
      })
      const theClass = await this.classService.update(
        {
          name: request.input('name'),
          teacher_id: request.input('teacher_id'),
        },
        classId
      )

      return response.ok({
        messages: 'Kelas Berhasil Diubah',
        data: theClass,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const classId: number = params.id
      await this.classService.delete(classId)
      return response.ok({
        message: 'Kelas Berhasil Dihapus',
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
