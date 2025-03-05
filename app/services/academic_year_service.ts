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

  async update(data: any, academicYearId: number):Promise<any> {
    const academicYear = await AcademicYear.findOrFail(academicYearId)
    academicYear.merge(data)
    return await academicYear.save()
  }

  async delete(id: number) { 
    const academic_year = await db.from('academic_years').where('id', id).delete()
    return academic_year
  }
}
