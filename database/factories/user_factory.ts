import factory from '@adonisjs/lucid/factories'
import User from '#models/user'
import { fakerID_ID as faker } from '@faker-js/faker'

export const UserFactory = factory
  .define(User, async ({}) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()

    return {
      username: `${firstName}.${lastName}`.toLowerCase(),
      email: faker.internet.email({ firstName, lastName }),
      password: 'password',
    }
  })
  .build()
