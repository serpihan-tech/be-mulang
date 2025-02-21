import factory from '@adonisjs/lucid/factories'
import Teacher from '#models/teacher'
import User from '#models/user'

export const TeacherFactory = factory
  .define(Teacher, async ({ faker }) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const user = await User.query()
      .whereBetween('id', [3, 5]) // Ambil user dengan ID antara 3 dan 5
      .whereNotIn('id', (query) => {
        query.from('teachers').select('user_id') // Pastikan belum dipakai di tabel teachers
      })
      .firstOrFail() // Ambil user pertama yang memenuhi kriteria

    return {
      user_id: user.id,
      name: `${firstName} ${lastName}`,
      nip: faker.string.alphanumeric({ length: { min: 10, max: 15 } }),
      phone: faker.number.int({ min: 11, max: 13 }).toString(),
      address:
        faker.location.city() +
        faker.location.county() +
        faker.location.streetAddress() +
        faker.location.buildingNumber(),
      profile_picture: faker.string.alphanumeric({ length: 25 }),
    }
  })
  .build()
