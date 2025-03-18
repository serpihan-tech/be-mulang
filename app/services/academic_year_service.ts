import AcademicYear from '#models/academic_year'
import db from '@adonisjs/lucid/services/db'
import AcademicYearContract from '../contracts/academicyear_contract.js'
import Student from '#models/student'

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
    const academicYear = await AcademicYear.filter(params).paginate(1, 10)
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
    const trx = await db.transaction()
    try {
      const academicYear = await AcademicYear.findOrFail(academicYearId)
      academicYear.merge(data)
      await academicYear.useTransaction(trx).save()
      await trx.commit()
      return academicYear
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number) {
    const academicYear = await AcademicYear.query().where('id', id).firstOrFail()
    return await academicYear.delete()
  }
}
