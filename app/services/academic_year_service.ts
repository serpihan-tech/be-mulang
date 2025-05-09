import AcademicYear from '#models/academic_year'
import db from '@adonisjs/lucid/services/db'
import AcademicYearContract from '../contracts/academicyear_contract.js'
import Student from '#models/student'
import { DateTime } from 'luxon'

export default class AcademicYearService implements AcademicYearContract {
  async getMyAcademicYear(studentId: number): Promise<any> {
    // console.log('service student id', studentId)
    const student = await Student.query()
      .where('id', studentId)
      .preload('classStudent', (query) => {
        query
          .select('academic_year_id')
          .groupBy('academic_year_id')
          .distinct()
          .preload('academicYear', (ay) =>
            ay.select('name', 'semester', 'date_start', 'date_end', 'status')
          )
      })
      .firstOrFail()

    return student
  }

  async getAll(params: any): Promise<any> {
    const sortBy = params.sortBy
    const sortOrder = params.sortOrder

    const academicYear = await AcademicYear.query()
      .if(params.search, (query) => {
        query
          .where('name', 'like', `%${params.search}%`)
          .orWhere('semester', 'like', `%${params.search}%`)
          .orWhere('status', 'like', `%${params.search}%`)
          .orWhere('date_start', 'like', `%${params.search}%`)
          .orWhere('date_end', 'like', `%${params.search}%`)
      })
      .if(params.tahunAjar, (query) => {
        query.where('name', params.tahunAjar)
      })
      .if(params.semester, (query) => {
        query.where('semester', params.semester)
      })
      .if(params.status, (query) => {
        query.where('status', params.status)
      })
      .if(sortBy === 'id', (qs) => qs.orderBy('id', sortOrder || 'asc'))
      .if(sortBy === 'tahunAjar', (qs) => qs.orderBy('name', sortOrder || 'asc'))
      .if(sortBy === 'semester', (qs) => qs.orderBy('semester', sortOrder || 'asc'))
      .if(sortBy === 'status', (qs) => qs.orderBy('status', sortOrder || 'asc'))
      .if(sortBy === 'tanggalMulai', (qs) => qs.orderBy('date_start', sortOrder || 'asc'))
      .if(sortBy === 'tanggalSelesai', (qs) => qs.orderBy('date_end', sortOrder || 'asc'))
      .paginate(Number(params.page) || 1, Number(params.limit) || 10)

    return academicYear
  }

  async getOne(academicYearId: number): Promise<any> {
    const academicYear = await AcademicYear.query().where('id', academicYearId).firstOrFail()
    return academicYear
  }

  async create(data: any) {
    const trx = await db.transaction()
    try {
      const academicYear = await AcademicYear.create(data, { client: trx })
      await trx.commit()

      return academicYear
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(data: any, academicYearId: number): Promise<any> {
    // console.log('update', data, academicYearId)
    const academicYear = await AcademicYear.findOrFail(academicYearId)
    await academicYear.merge(data).save()

    return academicYear
  }

  async delete(id: number) {
    const academicYear = await AcademicYear.query().where('id', id).firstOrFail()
    return await academicYear.delete()
  }

  async getActiveAcademicYear() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')

    const academicYear = await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .first()

    if (academicYear) {
      return await AcademicYear.query().where('name', academicYear.name).orderBy('semester', 'asc')
    }

    return await AcademicYear.query().where('status', 1)
  }
}
