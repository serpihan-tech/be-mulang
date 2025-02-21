import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      username: `${firstName}.${lastName}`.toLowerCase(),
      email: faker.internet.email({ firstName, lastName }),
      password: 'password',
    }
  })
  .build()
