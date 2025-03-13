import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import ScoreService from '#services/score_service'
import { createScoreValidator, updateScoreValidator } from '#validators/score'

@inject()
export default class ScoresController {
  constructor(private scroreService: ScoreService) {}
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const scores = await this.scroreService.get()
      return response.ok({
        message: 'Berhasil Mendapatkan Data Nilai',
        scores,
      })
    } catch (error) {
      return response.send({ error })
    }
  }

  async getByFilter({ request, response }: HttpContext) {
    const filter = {
      moduleId: request.input('moduleId', null),
      classStudentId: request.input('classStudentId', null),
      scoreTypeId: request.input('scoreTypeId', null),
    }
    const page = request.input('page')
    const limit = request.input('limit')

    try {
      const columns = ['module_id', 'class_student_id', 'type_score_id']

      const scores = await this.scroreService.getByFilter(columns, filter, page, limit)
      return response.ok({
        message: 'Berhasil Mendapatkan Data Nilai',
        scores,
      })
    } catch (error) {
      return response.send({ error })
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
      const data = request.all()

      await createScoreValidator.validate(data)

      const score = await this.scroreService.create(data)

      return response.ok({
        message: 'Score Berhasil Ditambahkan',
        score,
      })
    } catch (error) {
      return response.send({ error })
    }
  }

  /**
   * Show individual record
   */
  async show({}: HttpContext) {}

  /**
   * Edit individual record
   */
  async edit({}: HttpContext) {}

  /**
   * Handle form submission for the edit action
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const id = params.id
      const data = request.all()

      await updateScoreValidator.validate(data)

      await this.scroreService.update(data, id)

      return response.ok({
        message: 'Data Berhasil Diupdate',
        data,
      })
    } catch (error) {
      return response.send({ error })
    }
  }

  async massUpdate({ request, response }: HttpContext) {
    try {
      // body data
      const data = request.input('data')

      // checking data is array
      if (!Array.isArray(data) || data.length === 0) {
        return response.badRequest({ error: { message: 'Tidak ada data yang diproses' } })
      }

      // Validasi
      if (Array.isArray(data)) {
        for (const datum of data) {
          await updateScoreValidator.validate(datum)
          await this.scroreService.massUpdate(datum)
        }
      }
      return response.ok({
        message: 'Data Berhasil Diupdate sercara massive',
        data,
      })
    } catch (error) {
      return response.send({ error })
    }
  }

  /**
   * Delete record
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const id = params.id
      await this.scroreService.delete(id)

      return response.ok({
        messages: 'Data Behasil Dihapus',
      })
    } catch (error) {
      return response.send({ error })
    }
  }
}
