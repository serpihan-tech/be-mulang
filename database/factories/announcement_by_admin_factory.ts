import factory from '@adonisjs/lucid/factories'
import AnnouncementByAdmin from '#models/announcement_by_admin'
import { fakerID_ID as faker } from '@faker-js/faker'

export const AnnouncementByAdminFactory = factory
  .define(AnnouncementByAdmin, async ({}) => {
    return {
      title: faker.lorem.sentence(),
      content: faker.lorem.paragraph(),
      admin_id: faker.helpers.arrayElement([1, 2]),
      date: faker.date.past(),
      files: faker.image.urlPicsumPhotos({ width: 400, height: 240 }),
      target_roles: faker.helpers.arrayElement(['student', 'teacher']),
      category: faker.helpers.arrayElement([
        'Akademik',
        'Administrasi',
        'Informasi Umum',
        'Kegiatan Sekolah',
        'Fasilitas',
        'Prestasi',
      ]),
    }
  })
  .build()
