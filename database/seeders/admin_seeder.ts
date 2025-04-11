// import { AdminFactory } from '#database/factories/admin_factory'
import Admin from '#models/admin'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Admin.createMany([
      {
        name: 'Admin Semarang (Gunungpati)',
        userId: 1,
        phone: '08123456789',
        address: 'Jl. Gunungpati, Semarang',
        profilePicture: 'https://via.placeholder.com/150',
      },
      {
        name: 'Admin Semarang',
        userId: 2,
        phone: '08654321098',
        address: 'Gang Pemuda, Semarang',
        profilePicture: 'https://via.placeholder.com/250',
      },
    ])
  }
}
