import Schedule from '#models/schedule'
import db from '@adonisjs/lucid/services/db'
import ScheduleContract from '../contracts/schedule_contract.js'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'
// import db from '@adonisjs/lucid/services/db'

export class ScheduleService implements ScheduleContract {
  async getAll(params: any): Promise<any> {
    const sortBy = params.sortBy
    const sortOrder = params.sortOrder
    const academicYear = await this.activeSemester()

    const kelas = Array.isArray(params.kelas)
      ? params.kelas.map((k: string) => (k ?? '').toString().trim())
      : [(params.kelas ?? '').toString().trim()]

    const hari = Array.isArray(params.hari)
      ? params.hari.map((h: string) => (h ?? '').toString().trim())
      : [(params.hari ?? '').toString().trim()]

    const mapel = Array.isArray(params.mapel)
      ? params.mapel.map((m: string) => (m ?? '').toString().trim())
      : [(params.mapel ?? '').toString().trim()]

    const guru = Array.isArray(params.guru)
      ? params.guru.map((g: string) => (g ?? '').toString().trim())
      : [(params.guru ?? '').toString().trim()]

    const ruang = Array.isArray(params.ruang)
      ? params.ruang.map((r: string) => (r ?? '').toString().trim())
      : [(params.ruang ?? '').toString().trim()]

    const schedule = Schedule.query()
      .whereHas('module', (m) =>
        m.where('academic_year_id', params?.tahunAjar?.trim() ? params.tahunAjar : academicYear.id)
      )

      .if(params.search && params.search !== ' ', (q) =>
        q
          .orWhereHas('class', (cl) => cl.where('name', 'like', `%${params.search}%`))
          .orWhereHas('module', (m) =>
            m
              .where('name', 'like', `%${params.search}%`)
              .orWhereHas('teacher', (t) => t.where('name', 'like', `%${params.search}%`))
          )
          .orWhereHas('room', (r) => r.where('name', 'like', `%${params.search}%`))
      )
      .if(params.hari && params.hari !== '', (query) => query.whereIn('days', hari))
      .if(params.kelas, (k) => k.whereHas('class', (cls) => cls.whereIn('name', kelas)))
      .if(params.mapel, (mpl) => mpl.whereHas('module', (mdl) => mdl.whereIn('name', mapel)))
      .if(params.guru, (mpl) =>
        mpl.whereHas('module', (mdl) => mdl.whereHas('teacher', (tc) => tc.whereIn('name', guru)))
      )
      .if(params.ruang, (ru) => ru.whereHas('room', (ro) => ro.whereIn('name', ruang)))

      // sorting
      .if(sortBy === 'id', (i) => i.orderBy('id', sortOrder || 'asc'))
      .if(sortBy === 'hari', (hr) => hr.orderBy('days', sortOrder || 'asc'))
      .if(sortBy === 'mulai', (jm) => jm.orderBy('start_time', sortOrder || 'asc'))
      .if(sortBy === 'selesai', (js) => js.orderBy('end_time', sortOrder || 'asc'))
      .if(sortBy === 'kelas', (q) =>
        q
          .join('classes', 'schedules.class_id', '=', 'classes.id')
          .orderBy('classes.name', sortOrder || 'asc')
          .select('schedules.*')
      )
      .if(sortBy === 'mapel', (q) =>
        q
          .join('modules', 'schedules.module_id', '=', 'modules.id')
          .orderBy('modules.name', sortOrder || 'asc')
          .select('schedules.*')
      )
      .if(sortBy === 'guru', (q) =>
        q
          .join('modules', 'schedules.module_id', '=', 'modules.id')
          .join('teachers', 'modules.teacher_id', '=', 'teachers.id')
          .orderBy('teachers.name', sortOrder || 'asc')
          .select('schedules.*')
      )
      .if(sortBy === 'ruang', (q) =>
        q
          .join('rooms', 'schedules.room_id', '=', 'rooms.id')
          .orderBy('rooms.name', sortOrder || 'asc')
          .select('schedules.*')
      )

      .preload('module', (m) =>
        m.preload('academicYear').preload('teacher', (t) => t.select('id', 'name'))
      )
      .preload('class')
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

  async TeachersSchedule(teacherId: number, params?: any): Promise<any[]> {
    const activeAcademicYear = await this.activeSemester()
    const activeAcademicYearId = params.tahunAjar ?? activeAcademicYear.id
    const classes = await Schedule.query()
      .select('id', 'days', 'class_id', 'module_id', 'room_id', 'start_time', 'end_time')
      .whereHas('module', (query) => {
        query.where('teacher_id', teacherId).andWhereHas('academicYear', (ay) => {
          ay.where('status', 1).andWhere('id', activeAcademicYearId)
        })
      })
      .preload('class', (c) => {
        c.withCount('classStudent', (cs) =>
          cs.as('total_students').where('academic_year_id', activeAcademicYearId)
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
