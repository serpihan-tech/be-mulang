/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { fakerID_ID as faker } from '@faker-js/faker'
import Teacher from '#models/teacher'
// import Schedule from '#models/schedule'
import Class from '#models/class'
import Module from '#models/module'

export const AnnouncementByTeacherFactory = factory
  .define(AnnouncementByTeacher, async () => {
    const teacherIds = (await Teacher.all()).map((t) => t.id)
    const classIds = (await Class.all()).map((s) => s.id)
    const moduleIds = (await Module.query().whereIn('academic_year_id', [5, 6])).map((m) => m.id)

    return {
      teacherId: faker.helpers.arrayElement(teacherIds),
      classId: faker.helpers.arrayElement(classIds),
      moduleId: faker.helpers.arrayElement(moduleIds),
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      category: 'Akademik',
      content: faker.lorem.paragraph(8),
      date: faker.date.past(),
      files: faker.image.urlPicsumPhotos({ width: 400, height: 240 }),
    }
  })
  .build()
