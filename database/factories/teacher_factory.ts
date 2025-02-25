import { fakerID_ID as faker } from '@faker-js/faker'
import factory from '@adonisjs/lucid/factories'
import Teacher from '#models/teacher'
import User from '#models/user'

export const TeacherFactory = factory
  .define(Teacher, async () => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const user = await User.query()
      .whereBetween('id', [3, 5])
      .whereNotIn('id', (query) => {
        query.from('teachers').select('user_id')
      })
      .firstOrFail()

    return {
      user_id: user.id,
      name: `${firstName} ${lastName}`,
      nip: faker.string.numeric({ length: 18 }),
      phone: faker.phone.number({ style: 'human' }),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.county()}`,
      profile_picture: faker.image.avatar(),
    }
  })
  .build()
