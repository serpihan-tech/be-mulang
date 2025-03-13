import factory from '@adonisjs/lucid/factories'
import Admin from '#models/admin'
import User from '#models/user'
import { fakerID_ID as faker } from '@faker-js/faker'

export const AdminFactory = factory
  .define(Admin, async ({}) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const user = await User.query()
      .whereBetween('id', [1, 2])
      .whereNotIn('id', (query) => {
        query.from('admins').select('user_id')
      })
      .firstOrFail()

    return {
      name: `${firstName} ${lastName}`,
      userId: user.id,
    }
  })
  .build()
