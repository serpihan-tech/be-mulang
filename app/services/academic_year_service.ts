import AcademicYear from "#models/academic_year"
import db from "@adonisjs/lucid/services/db"
export default class AcademicYearService {
  async get(column: string[], academicYearId?: number) {
    if (academicYearId) {
      const academic_year = await db.from('academic_years').where('id', academicYearId).select(column)
      return academic_year
    }
    const academic_years = await db.from('academic_years').select(column)
    return academic_years
  }

  async create(data: any) {
    const trx = await db.transaction()
    try {
      const academic_year = await AcademicYear.create(data, { client: trx })
      await trx.commit()

      return academic_year
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
    const academic_year = await AcademicYear.query().where('id', id).firstOrFail()
    return await academic_year.delete()
  }
}
