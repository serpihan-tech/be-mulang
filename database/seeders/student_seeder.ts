import { StudentFactory } from '#database/factories/student_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await StudentFactory.createMany(450)
  }
}
