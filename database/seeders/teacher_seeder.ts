import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { TeacherFactory } from '#database/factories/teacher_factory'

export default class extends BaseSeeder {
  async run() {
    await TeacherFactory.createMany(3)
  }
}
