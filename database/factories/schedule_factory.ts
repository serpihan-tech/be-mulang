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
    const startTime = DateTime.now().set({ hour: 8, minute: 0, second: 0 })
    const endTime = DateTime.now().set({ hour: 17, minute: 0, second: 0 })
    const days = faker.helpers.arrayElement([
      Days.SENIN,
      Days.SELASA,
      Days.RABU,
      Days.KAMIS,
      Days.JUMAT,
      Days.SABTU,
      Days.MINGGU,
    ])

    return {
      class_id: faker.helpers.arrayElement(classIds),
      days: days,
      start_time: startTime.toFormat('HH:mm:ss'),
      end_time: endTime.toFormat('HH:mm:ss'),
      room_id: faker.helpers.arrayElement(roomIds),
      module_id: faker.helpers.arrayElement(moduleIds),
    }
  })
  .build()
