import { AdminFactory } from '#database/factories/admin_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await AdminFactory.createMany(2)
  }
}
