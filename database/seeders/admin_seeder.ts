// import { AdminFactory } from '#database/factories/admin_factory'
import Admin from '#models/admin'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Admin.createMany([
      {
        name: 'Admin Semarang (Gunungpati)',
        userId: 1,
      },
      {
        name: 'Admin Semarang',
        userId: 2,
      },
    ])
  }
}
