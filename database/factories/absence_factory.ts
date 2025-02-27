import factory from '@adonisjs/lucid/factories'
import Absence, { Status } from '#models/absence'
import { fakerID_ID as faker } from '@faker-js/faker'
import Schedule from '#models/schedule'
import ClassStudent from '#models/class_student'
import { DateTime } from 'luxon'

export const AbsenceFactory = factory
  .define(Absence, async () => {
    const csIds = await ClassStudent.query()
      .select('id')
      .then((rows) => rows.map((row) => row.id))
    const scheduleIds = await Schedule.query()
      .select('id')
      .then((rows) => rows.map((row) => row.id))

    const status = faker.helpers.arrayElement([
      Status.HADIR,
      Status.IZIN,
      Status.SAKIT,
      Status.LAINNYA,
    ])
    const reason = status === Status.LAINNYA ? faker.lorem.sentence() : ''

    const date = DateTime.now().set({ day: 1, month: 2, year: 2025 })

    return {
      class_student_id: faker.helpers.arrayElement(csIds),
      schedule_id: faker.helpers.arrayElement(scheduleIds),
      status: status,
      reason: reason,
      date: date,
    }
  })
  .build()
