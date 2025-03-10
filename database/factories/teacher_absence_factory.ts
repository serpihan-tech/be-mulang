/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import TeacherAbsence from '#models/teacher_absence'
import { fakerID_ID as faker } from '@faker-js/faker'
import Teacher from '#models/teacher'
import { DateTime } from 'luxon'

export const TeacherAbsenceFactory = factory
  .define(TeacherAbsence, async ({}) => {
    const teacherIds = (await Teacher.all()).map((t) => t.id)
    const randomMinutes = faker.number.int({ min: 0, max: 59 })
    const CheckIn: DateTime = DateTime.now().set({ hour: 6, minute: randomMinutes, second: 0 }) // Nilai awal
    const randomDuration = faker.number.int({ min: 5, max: 9 })
    const CheckOut: DateTime = CheckIn.plus({ hours: randomDuration })

    return {
      teacher_id: faker.helpers.arrayElement(teacherIds),
      date: faker.date.past(),
      check_in_time: CheckIn.toFormat('HH:mm:ss'),
      check_out_time: CheckOut.toFormat('HH:mm:ss'),
    }
  })
  .build()
