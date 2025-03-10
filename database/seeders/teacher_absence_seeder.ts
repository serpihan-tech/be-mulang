import { TeacherAbsenceFactory } from '#database/factories/teacher_absence_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await TeacherAbsenceFactory.createMany(70)
  }
}
