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
  async index({response}: HttpContext) {
    try {
      const columns = ['name', 'teacher_id', 'academic_year_id']
      const modules = await this.moduleService.get(columns)

      return response.ok({
        message: 'Berhasil Mendapatkan Data Modul',
        modules
      })
    } catch (error) {
      throw response.send({
        "error": {
          ...error
        }
      }) 
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
        module
      })
    }catch (error){
      return  error
    }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {
    
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    const moduleId= params.id
    try {
      await updateModuleValidator.validate(request.all())
      const module = await this.moduleService.update(request.all(), moduleId)

      return response.ok({
        message: 'Modul Berhasil Diubah',
        module
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
        message: 'Modul Berhasil Dihapus'
      })
    } catch (error) {
      return response.notFound({ error: { message: 'ID Modul Tidak Ditemukan' } })
    }
  }
}