import factory from '@adonisjs/lucid/factories'
import UsersFactory from '#models/user'

export const UserFactory = factory
  .define(UsersFactory, async ({ faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      username: `${firstName}.${lastName}`.toLowerCase(),
      email: faker.internet.email({ firstName, lastName }),
      password: 'password',
    }
  })
  .build()
