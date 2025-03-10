import { StudentDetailFactory } from '#database/factories/student_detail_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await StudentDetailFactory.createMany(450)
  }
}
