import { fakerID_ID as faker } from '@faker-js/faker'
import factory from '@adonisjs/lucid/factories'
import Teacher from '#models/teacher'
import User from '#models/user'

// Set global untuk menyimpan user_id yang sudah dipakai
const usedUserIds = new Set<number>()

export const TeacherFactory = factory
  .define(Teacher, async () => {
    // Ambil semua user yang memenuhi kriteria
    let users = await User.query()
      .whereBetween('id', [3, 10])
      .whereNotIn('id', (query) => {
        query.from('teachers').select('user_id')
      })

    // Filter user yang belum digunakan
    users = users.filter((user) => !usedUserIds.has(user.id))

    if (users.length === 0) {
      throw new Error('Tidak ada user yang tersedia untuk menjadi teacher.')
    }

    // Pilih user secara acak
    const user = faker.helpers.arrayElement(users)

    // Tambahkan user_id ke set agar tidak dipakai lagi
    usedUserIds.add(user.id)

    return {
      user_id: user.id,
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      nip: faker.string.numeric({ length: 18 }),
      phone: faker.phone.number({ style: 'human' }),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.county()}`,
      profile_picture: faker.image.avatar(),
    }
  })
  .build()
