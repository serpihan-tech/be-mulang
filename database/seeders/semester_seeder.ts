import { SemesterFactory } from '#database/factories/semester_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await SemesterFactory.createMany(4)
  }
}
