import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ModuleService from '#services/module_service'
import { createModuleValidator, updateModuleValidator } from '#validators/module'

@inject()
export default class ModulesController {
  constructor(private moduleService: ModuleService) {}
  /**
   * Display a list of resource
   */
  async index({ response, request }: HttpContext) {
    try {
      const modules = await this.moduleService.getAll(request.all())

      return response.ok({
        message: 'Berhasil Mendapatkan Data Modul',
        modules,
      })
    } catch (error) {
      throw response.status(error.status).send({ error })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      await createModuleValidator.validate(request.all())
      const module = await this.moduleService.create(request.all())

      return response.created({
        message: 'Modul Berhasil Dibuat',
        module,
      })
    } catch (error) {
      return response.status(error.status).send({ error })
    }
  }

  /**
   * Show individual record
   */
  async show({ params, response }: HttpContext) {
    const id = params.id
    try {
      const module = await this.moduleService.getOne(id)
      return response.ok({
        message: 'Module Berhasil Ditampilkan',
        module,
      })
    } catch (error) {
      return response.status(error.status).send({ error })
    }
  }

  /**
   * Edit individual record
   */
  async edit({ params, request, response }: HttpContext) {
    const id = params.id
    try {
      const module = this.moduleService.update(request, id)
      return response.ok({
        message: 'Module Berhasil Diupdate',
        module,
      })
    } catch (error) {
      return response.status(error.status).send({ error })
    }
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const moduleId = params.id
    try {
      await updateModuleValidator.validate(request.all())
      const module = await this.moduleService.update(request.all(), moduleId)

      return response.ok({
        message: 'Modul Berhasil Diubah',
        module,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await this.moduleService.delete(params.id)
      return response.ok({
        message: 'Modul Berhasil Dihapus',
      })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Modul Tidak Ditemukan' } })
    }
  }
}
