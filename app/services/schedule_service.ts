import Schedule from '#models/schedule'
import db from '@adonisjs/lucid/services/db'
import ScheduleContract from '../contracts/schedule_contract.js'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'
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

  async TeachersSchedule(teacherId: number): Promise<any[]> {
    const activeAcademicYear = await this.activeSemester()
    const classes = await Schedule.query()
      .select('id', 'days', 'class_id', 'module_id', 'room_id', 'start_time', 'end_time')
      .whereHas('module', (query) => {
        query.where('teacher_id', teacherId).andWhereHas('academicYear', (ay) => {
          ay.where('status', 1).andWhere('id', activeAcademicYear.id)
        })
      })
      .preload('class', (c) => {
        c.withCount('classStudent', (cs) =>
          cs.as('total_students').where('academic_year_id', activeAcademicYear.id)
        )
      })
      .preload('module', (m) => {
        m.select('id', 'name', 'academic_year_id', 'teacher_id')
        m.where('teacher_id', teacherId)
        m.preload('academicYear', (ay) =>
          ay.select('id', 'name', 'semester', 'date_start', 'date_end', 'status')
        )
      })
      .preload('room', (r) => r.select('id', 'name'))

    // classes.forEach((item) => {
    //   console.log(`total students of ${item.class.name} (`, item.class.$extras.total_students, ')')
    // })

    return classes.map((item) => ({
      ...item.serialize(),
      totalStudents: item.class.$extras.total_students,
    }))
  }

  async activeSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(now)

    return await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }
}
