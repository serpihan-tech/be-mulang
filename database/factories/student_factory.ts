import factory from '@adonisjs/lucid/factories'
import Student from '#models/student'
import { fakerID_ID as faker } from '@faker-js/faker'
import User from '#models/user'

const usedUserIds = new Set<number>()

export const StudentFactory = factory
  .define(Student, async ({}) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    let users = await User.query()
      .whereBetween('id', [11, 111])
      .whereNotIn('id', (query) => {
        query.from('students').select('user_id')
      })

    // Filter user yang belum digunakan
    users = users.filter((user) => !usedUserIds.has(user.id))

    if (users.length === 0) {
      throw new Error('Tidak ada user yang tersedia untuk menjadi student.')
    }

    // Pilih user secara acak
    const user = faker.helpers.arrayElement(users)

    // Tambahkan user_id ke set agar tidak dipakai lagi
    usedUserIds.add(user.id)

    let Graduate = false

    if (user.id >= 100 && user.id <= 112) {
      Graduate = true
    }

    return {
      user_id: user.id,
      name: `${firstName} ${lastName}`,
      is_graduate: Graduate,
    }
  })
  .build()
