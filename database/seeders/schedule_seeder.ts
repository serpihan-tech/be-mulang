import { ScheduleFactory } from '#database/factories/schedule_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ScheduleFactory.createMany(40)
  }
}
