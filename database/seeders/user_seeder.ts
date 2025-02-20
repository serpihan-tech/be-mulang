import { UserFactory } from '#database/factories/user_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    await UserFactory.createMany(6)

    await User.create({
      username: 'test1',
      email: 'test1@test.com',
      password: 'password',
    })
  }
}
