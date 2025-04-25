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
   * Handle form submission for the create action
   */
  async store({ request, response }: HttpContext) {
    try {
      await createModuleValidator.validate(request.all())
      const module = await this.moduleService.create(request.all())

      return response.created({
        message: 'Mapel Berhasil Dibuat',
        module,
      })
    } catch (error) {
      return response.badRequest({ error })
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
        message: 'Mapel Berhasil Ditampilkan',
        module,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Mapel Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
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
        message: 'Mapel Berhasil Diubah',
        module,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Mapel Tidak Ditemukan' } })
      return response.badRequest({ error })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const module: string = await this.moduleService.delete(params.id)
      return response.ok({
        message: `Mapel (${module}) Berhasil Dihapus`,
      })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Mapel Tidak Ditemukan' } })
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async listNames({ request, response }: HttpContext) {
    try {
      const modules = await this.moduleService.getAllNames(request.all())
      return response.ok({
        message: 'Berhasil Mendapatkan Data Modul',
        modules,
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async listModules({ request, response }: HttpContext) {
    try {
      const modules = await this.moduleService.listModules(request.all())
      return response.ok({ message: 'List Mapel Berhasil Ditemukan', modules })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
