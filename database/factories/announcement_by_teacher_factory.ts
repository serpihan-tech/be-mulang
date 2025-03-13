/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { fakerID_ID as faker } from '@faker-js/faker'
import Teacher from '#models/teacher'
import Schedule from '#models/schedule'

export const AnnouncementByTeacherFactory = factory
  .define(AnnouncementByTeacher, async () => {
    const teacherIds = (await Teacher.all()).map((t) => t.id)
    const scheduleIds = (await Schedule.all()).map((s) => s.id)

    return {
      teacherId: faker.helpers.arrayElement(teacherIds),
      scheduleId: faker.helpers.arrayElement(scheduleIds),
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      content: faker.lorem.paragraph(8),
      date: faker.date.past(),
      files: faker.image.urlPicsumPhotos({ width: 400, height: 240 }),
    }
  })
  .build()
