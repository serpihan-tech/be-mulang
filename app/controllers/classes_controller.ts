import { createClassValidator, updateClassValidator } from '#validators/class'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { ClassService } from '#services/class_service'

@inject()
export default class ClassesController {
  constructor(private classService: ClassService) {}
  async index({ request, response }: HttpContext) {
    try {
      const theClass = await this.classService.getAll(request.all())
      return response.ok({
        message: 'Kelas Berhasil Ditampilkan',
        theClass,
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

  async show({ params, response }: HttpContext) {
    const id: number = params.id
    try {
      const theClass = await this.classService.getOne(id)
      return response.ok({
        messages: 'Kelas Berhasil ditampilkan',
        data: theClass,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async edit({}: HttpContext) {}

  async update({ params, request, response }: HttpContext) {
    const id: number = params.id
    try {
      await updateClassValidator.validate(request.all())
      const theClass = await this.classService.update(request.all(), id)

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
