import type { HttpContext } from '@adonisjs/core/http'
import AcademicYear from '#models/academic_year'
import { createRecordValidator } from '#validators/academic_year'
import { inject } from '@adonisjs/core'
import AcademicYearService from '#services/academic_year_service'

@inject()
export default class AcademicYearsController {
  constructor(private academicYearService: AcademicYearService) { }
  /**
   * Display a list of resource
   */
  async index({ response }: HttpContext) {
    try {
      const column = ['id', 'name', 'date_start', 'date_end', 'academic_year', 'status']
      const academic_years = await this.academicYearService.get(column)

      return response.ok({
        status: true,
        code: 200,
        data: academic_years
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

  /**
   * Display form to create a new record
   */
  async create({ }: HttpContext) {
  }

  /**
   * Handle form submission for the create action
  */
  async store({ request, response }: HttpContext) {
    const academicYear = new AcademicYear()
    try {
      academicYear.name = request.input('name')
      academicYear.date_start = request.input('date_start')
      academicYear.date_end = request.input('date_end')
      academicYear.academic_year = request.input('academic_year')
      academicYear.status = request.input('status')

      await createRecordValidator.validate(academicYear)
      await academicYear.save()

      return { message: 'Tahun Ajaran Berhasil Ditambahkan', data: academicYear }
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

  /**
   * Show individual record
  */
  async show({ params, response }: HttpContext) {
    const id: number = params.id
    try {
      const column = ['id', 'name', 'date_start', 'date_end', 'academic_year', 'status']
      const academic_years = await this.academicYearService.get(column, id)
      return response.ok({
        status: true,
        code: 200,
        data: academic_years
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
    

  }

  /**
   * Edit individual record
   */
  async edit({ params }: HttpContext) { }

  /**
   * Handle form submission for the edit action
   */
  async update({ }: HttpContext) { }

  /**
   * Delete record
   */
  async destroy({ params }: HttpContext) {
    const id: number = params.id
    await this.academicYearService.delete(id)
    return { message: 'Kelas Berhasil Dihapus' }
  }
}