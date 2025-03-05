import { AcademicYearFactory } from '#database/factories/academic_year_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await AcademicYearFactory.createMany(5)
  }
}
