/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import Schedule, { Days } from '#models/schedule'
import Module from '#models/module'
import Class from '#models/class'
import Room from '#models/room'
import { fakerID_ID as faker } from '@faker-js/faker'
import { DateTime } from 'luxon'

export const ScheduleFactory = factory
  .define(Schedule, async ({}) => {
    const moduleIds = (await Module.all()).map((module) => module.id)
    const classIds = (await Class.all()).map((class_) => class_.id)
    const roomIds = (await Room.all()).map((room) => room.id)

    const classId = faker.helpers.arrayElement(classIds)
    const day = faker.helpers.arrayElement([
      Days.SENIN,
      Days.SELASA,
      Days.RABU,
      Days.KAMIS,
      Days.JUMAT,
      Days.SABTU,
      Days.MINGGU,
    ])

    let startTime: DateTime = DateTime.now().set({ hour: 8, minute: 0, second: 0 }) // Nilai awal
    let endTime: DateTime = startTime.plus({ hours: 2 }) // Default 1 jam
    let isOverlapping = true

    while (isOverlapping) {
      const startHour = faker.helpers.arrayElement([8, 9, 10, 11, 12, 13, 14, 15])
      const duration = faker.helpers.arrayElement([1, 2, 3]) // Durasi antara 1-3 jam

      startTime = DateTime.now().set({ hour: startHour, minute: 0, second: 0 })
      endTime = startTime.plus({ hours: duration })

      // Cek apakah ada jadwal yang bentrok di database
      const overlappingSchedule = await Schedule.query()
        .where('class_id', classId)
        .where('days', day)
        .where((query) => {
          query
            .whereBetween('start_time', [
              startTime.toFormat('HH:mm:ss'),
              endTime.toFormat('HH:mm:ss'),
            ])
            .orWhereBetween('end_time', [
              startTime.toFormat('HH:mm:ss'),
              endTime.toFormat('HH:mm:ss'),
            ])
            .orWhereRaw('? BETWEEN start_time AND end_time', [startTime.toFormat('HH:mm:ss')])
            .orWhereRaw('? BETWEEN start_time AND end_time', [endTime.toFormat('HH:mm:ss')])
        })
        .first()

      // Jika tidak ada bentrokan, keluar dari loop
      if (!overlappingSchedule) {
        isOverlapping = false
      }
    }

    return {
      class_id: classId,
      days: day,
      start_time: startTime.toFormat('HH:mm:ss'),
      end_time: endTime.toFormat('HH:mm:ss'),
      room_id: faker.helpers.arrayElement(roomIds),
      module_id: faker.helpers.arrayElement(moduleIds),
    }
  })
  .build()
