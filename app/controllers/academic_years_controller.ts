import type { HttpContext } from '@adonisjs/core/http'
import {
  createAcademicYearValidator,
  updateAcademicYearValidator
} from '#validators/academic_year'
import { inject } from '@adonisjs/core'
import AcademicYearService from '#services/academic_year_service'

@inject()
export default class AcademicYearsController {
  constructor(private academicYearService: AcademicYearService) { }
  /**
   * Display a list of resources
   */
  async index({ response }: HttpContext) {
    try {
      const column = ['id', 'name', 'date_start', 'date_end', 'semester', 'status']
      const academicYears = await this.academicYearService.get(column)

      return response.ok({
        message: 'Berhasil Mendapatkan Data Tahun Ajaran',
        academicYears
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({ }: HttpContext) {}

  /**
   * Handle form submission for the create action
  */
  async store({ request, response }: HttpContext) {
    try {
      await createAcademicYearValidator.validate(request.all())
      const academicYear = await this.academicYearService.create(request.all())

      return response.ok({
        message: 'Tahun Ajaran Berhasil Ditambahkan',
        academicYear
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  /**
   * Show individual record
  */
  async show({ params, response }: HttpContext) {
    const id: number = params.id
    try {
      const column = ['id', 'name', 'date_start', 'date_end', 'semester', 'status']
      const academicYears = await this.academicYearService.get(column, id)
      return response.ok({
        message: 'Berhasil Mendapatkan Data Tahun Ajaran',
        academicYears
      })
    } catch (error) {
      return response.badRequest({ error })
    }


  }

  /**
   * Edit individual record
   */
  async edit({ }: HttpContext) {
  }

  /**
   * Handle form submission for the edit action
  */
  async update({ params, request, response }: HttpContext) {
    const academicYearId: number = params.id
    try {
      await updateAcademicYearValidator.validate(request.all())
      const academicYear = await this.academicYearService.update(request.all(), academicYearId)

      return response.ok({
        message: 'Tahun Ajaran Berhasil Diubah', academicYear
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
      const id: number = params.id
      await this.academicYearService.delete(id)
      return response.ok({
        message: 'Kelas Berhasil Dihapus'
      })
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}