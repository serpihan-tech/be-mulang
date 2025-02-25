import { BaseSeeder } from '@adonisjs/lucid/seeders'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'

export default class UserHasRoleSeeder extends BaseSeeder {
  public async run() {
    const users = await User.all() // Ambil semua user yang sudah dibuat

    const userRoles = users.map((user) => {
      let roleId: number

      if (user.id >= 1 && user.id <= 2) {
        roleId = 1 // Admin
      } else if ((user.id >= 3 && user.id <= 5) || user.id === 13) {
        roleId = 2 // Teacher
      } else if (user.id >= 6 && user.id <= 12) {
        roleId = 3 // Student
      } else {
        roleId = 1 // Default to admin
      }

      return { user_id: user.id, role_id: roleId }
    })

    // Gunakan transaksi untuk mencegah deadlock
    await db.transaction(async (trx) => {
      await trx.table('user_has_roles').insert(userRoles)
    })
  }
}
