import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ScoreService from '#services/score_service'

@inject()
export default class ScoresController {
  constructor (private scroreService: ScoreService) {}
  /**
   * Display a list of resource
   */
  async index({response}: HttpContext) {
    try {
      const scores = await this.scroreService.get()
      return response.ok({
        message: 'Berhasil Mendapatkan Data Nilai',
        scores
      })
    } catch (error) {
      throw error
    }
  }

  async getByFilter({request, response}: HttpContext) {
    const filter = {
      moduleId: request.input('moduleId', null),
      classStudentId: request.input('classStudentId', null),
      scoreTypeId: request.input('scoreTypeId', null)
    }
    const page = request.input('page')
    const limit = request.input('limit')  

    try {
      const columns = ['module_id', 'class_student_id', 'type_score_id']

      const scores = await this.scroreService.getByFilter(columns, filter, page, limit)

      return response.ok({
        message: 'Berhasil Mendapatkan Data Nilai',
        scores
      })
    }
    catch (error) {
      throw error
    }
  }

  /**
   * Display form to create a new record
   */
  async create({}: HttpContext) {}

  /**
   * Handle form submission for the create action
   */
  async store({ request }: HttpContext) {
    try {
      const score = await this.scroreService.create(request.all())
      
    } catch (error) {
      
    }
  }

  /**
   * Show individual record
   */
  async show({ params }: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request }: HttpContext) {

  }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {

  }
}