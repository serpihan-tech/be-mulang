import { fakerID_ID as faker } from '@faker-js/faker'
import factory from '@adonisjs/lucid/factories'
import Teacher from '#models/teacher'
import User from '#models/user'

// Set global untuk menyimpan user_id yang sudah dipakai
const usedUserIds = new Set<number>()

export const TeacherFactory = factory
  .define(Teacher, async ({}) => {
    // Ambil semua user yang memenuhi kriteria
    let users = await User.query()
      .whereBetween('id', [3, 30])
      .whereNotIn('id', (query) => {
        query.from('teachers').select('user_id')
      })

    // Filter user yang belum digunakan
    users = users.filter((user) => !usedUserIds.has(user.id))

    if (users.length === 0) {
      throw new Error('Tidak ada user yang tersedia untuk menjadi teacher.')
    }

    const religion = faker.helpers.arrayElement([
      'Kristen',
      'Katolik',
      'Islam',
      'Hindu',
      'Budha',
      'Konghucu',
    ])

    // Pilih user secara acak
    const user = faker.helpers.arrayElement(users)
    const city = faker.location.city()
    const birthDate = faker.date.between({ from: '1970-01-01', to: '2003-06-01' })
    const birthPlace = city

    // Tambahkan user_id ke set agar tidak dipakai lagi
    usedUserIds.add(user.id)

    return {
      userId: user.id,
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      nip: faker.string.numeric({ length: 18 }),
      religion: religion,
      phone: faker.phone.number({ style: 'human' }),
      birthDate: birthDate,
      birthPlace: birthPlace,
      gender: faker.helpers.arrayElement(['Laki-laki', 'Perempuan']),
      address: `${faker.location.streetAddress()}, ${city}, ${faker.location.state()}`,
      profilePicture: faker.image.avatar(),
    }
  })
  .build()
