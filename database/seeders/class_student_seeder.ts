import { ClassStudentFactory } from '#database/factories/class_student_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ClassStudentFactory.createMany(500)
  }
}
