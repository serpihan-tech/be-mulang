import Schedule from '#models/schedule'
import ScheduleContract from '../contracts/schedule_contract.js'
// import db from '@adonisjs/lucid/services/db'

export class ScheduleService implements ScheduleContract {
  async getAll(page: number): Promise<any> {
    const limit = 10
    return await Schedule.query()
      .preload('module', (m) => m.preload('academicYear'))
      .preload('class', (c) => c.preload('teacher', (t) => t.select('id', 'name')))
      .preload('room')
      .paginate(page, limit)
  }

  async getById(id: number): Promise<any> {
    return await Schedule.query()
      .where('id', id)
      .preload('class', (c) => c.preload('teacher', (t) => t.select('id', 'name')))
      .preload('module', (m) => m.preload('academicYear'))
      .preload('room')
      .firstOrFail()
  }

  async create(data: any): Promise<Object> {
    const schedule = await Schedule.create({
      class_id: data.class_id,
      module_id: data.module_id,
      room_id: data.room_id,
      start_time: data.start_time,
      end_time: data.end_time,
      days: data.day,
    })

    await schedule.save()

    return schedule
  }

  async update(id: number, data: any): Promise<Object> {
    const schedule = await Schedule.query().where('id', id).firstOrFail()
    return await schedule.merge(data).save()
  }

  async delete(id: number): Promise<any> {
    const schedule = await Schedule.query().where('id', id).firstOrFail()
    return await schedule.delete()
  }
}
