import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role' // Sesuaikan dengan lokasi model Role

export default class RoleSeeder extends BaseSeeder {
  async run() {
    const roles = ['admin', 'teacher', 'student']

    for (const role of roles) {
      await Role.updateOrCreate({ role: role }, { role: role })
    }
  }
}
