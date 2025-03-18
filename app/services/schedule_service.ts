import Schedule from '#models/schedule'
import db from '@adonisjs/lucid/services/db'
import ScheduleContract from '../contracts/schedule_contract.js'
// import db from '@adonisjs/lucid/services/db'

export class ScheduleService implements ScheduleContract {
  async getAll(params: any): Promise<any> {
    const schedule = Schedule.filter(params)
      .preload('module', (m) => m.preload('academicYear'))
      .preload('class', (c) => c.preload('teacher', (t) => t.select('id', 'name')))
      .preload('room')
      .paginate(params.page || 1, params.limit || 10)
    return schedule
  }

  async getOne(id: number): Promise<any> {
    return await Schedule.query()
      .where('id', id)
      .preload('class', (c) => c.preload('teacher', (t) => t.select('id', 'name')))
      .preload('module', (m) => m.preload('academicYear'))
      .preload('room')
      .firstOrFail()
  }

  async create(data: any): Promise<Object> {
    const trx = await db.transaction()
    const schedule = await Schedule.create(data, { client: trx })
    await trx.commit()
    return schedule
  }

  async update(id: number, data: any): Promise<Object> {
    const trx = await db.transaction()
    const schedule = await Schedule.query().where('id', id).firstOrFail()
    schedule.merge(data)
    await schedule.useTransaction(trx).save()
    await trx.commit()
    return schedule
  }

  async delete(id: number): Promise<any> {
    const schedule = await Schedule.query().where('id', id).firstOrFail()
    return await schedule.delete()
  }
}
