import AcademicYear from '#models/academic_year'
import db from '@adonisjs/lucid/services/db'
export default class AcademicYearService {
  async get(academicYearId?: number, request?: any) {
    if (academicYearId) {
      const academicYear = await db.from('academic_years').where('id', academicYearId)
      return academicYear
    }
    const academicYear = await AcademicYear.filter(request)
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
