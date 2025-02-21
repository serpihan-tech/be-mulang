import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.createMany(6)

    for (let i = 0; i < 3; i++) {
      await User.create({
        username: `test${i}`,
        email: `test${i}@test.com`,
        password: 'password',
      })
    }
  }
}
