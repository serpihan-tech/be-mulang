import { AbsenceFactory } from '#database/factories/absence_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await AbsenceFactory.createMany(660)
  }
}
