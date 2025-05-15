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
      Status.ALFA,
    ])
    const reason = status === Status.IZIN ? faker.lorem.sentence() : ''

    const description = faker.lorem.sentence()

    // Generate tanggal acak dalam 1 tahun terakhir hingga hari ini
    const randomDays = faker.number.int({ min: 0, max: 365 })
    const date = DateTime.now().minus({ days: randomDays }).toFormat('yyyy-MM-dd')

    return {
      classStudentId: faker.helpers.arrayElement(csIds),
      scheduleId: faker.helpers.arrayElement(scheduleIds),
      status: status,
      reason: reason,
      description: description,
      date: date,
    }
  })
  .build()
