import Absence from '#models/absence'
import AcademicYear from '#models/academic_year'
import ClassStudent from '#models/class_student'
import { DateTime } from 'luxon'
import AbsenceContract from '../contracts/absence_contract.js'
import Database from '@adonisjs/lucid/services/db'
import Schedule from '#models/schedule'

export class AbsenceService implements AbsenceContract {
  // TODO : Implement
  getById(absenceId: number): Promise<any> {
    const absence = Absence.query()
      .where('id', absenceId)
      .preload('schedule', (s) => {
        s.select(['id', 'class_id', 'days', 'start_time', 'end_time'])
      })
      .preload('classStudent', (cs) => {
        cs.select(['id', 'class_id', 'student_id', 'academic_year_id'])
        cs.preload('academicYear', (ay) => ay.select(['id', 'semester']))
        cs.preload('class', (c) => c.select(['id', 'name']))
        cs.preload('student', (s) => {
          s.select(['id', 'name'])
          s.preload('studentDetail', (sd) => sd.select(['nis', 'nisn']))
        })
      })
      .firstOrFail()
    return absence
  }

  async getByStudentId(studentId: number): Promise<any> {
    console.log('Student ID:', studentId)

    const student = await Database.from('students')
      .where('id', studentId)
      .select('id')
      .firstOrFail()

    // console.log(
    //   await Database.from('absences')
    //     .innerJoin('class_students', 'class_students.id', 'absences.class_student_id')
    //     .where('class_students.student_id', studentId) // Pastikan hanya studentId terkait
    //     .groupBy('date')
    //     .select('absences.date')
    // )

    const absences = await Database.from('absences')
      .innerJoin('class_students', 'class_students.id', 'absences.class_student_id')
      .where('class_students.student_id', studentId) // Pastikan hanya studentId terkait
      .groupBy('absences.date')
      .select('absences.date')
      .select(
        Database.raw(`
          GROUP_CONCAT(DISTINCT absences.status ORDER BY FIELD(absences.status, 'alfa', 'sakit', 'izin', 'hadir') SEPARATOR ', ') as status_list
        `)
      )
      .select(
        Database.raw(`
        CASE 
          WHEN MIN(FIELD(absences.status, 'alfa', 'sakit', 'izin', 'hadir')) = 1 THEN 'Alfa'
          WHEN MIN(FIELD(absences.status, 'alfa', 'sakit', 'izin', 'hadir')) = 2 THEN 'Sakit'
          WHEN MIN(FIELD(absences.status, 'alfa', 'sakit', 'izin', 'hadir')) = 3 THEN 'Izin'
          ELSE 'Hadir'
        END as status
      `)
      )
      .select(
        Database.raw(`
        SUBSTRING_INDEX(
          GROUP_CONCAT(DISTINCT absences.reason ORDER BY FIELD(absences.status, 'izin', 'sakit', 'alfa', 'hadir') SEPARATOR '|'), 
          '|', 1
        ) as reason
      `)
      )
      .count('* as totalAbsenceInTheSameDay')

    return { student, absences }
  }

  async getAll(params?: any): Promise<any> {
    const firstSemester = await AcademicYear.query()
      .where('status', true)
      .orderBy('date_start', 'asc')
      .firstOrFail()

    const secondSemester = await AcademicYear.query()
      .where('status', true)
      .orderBy('date_start', 'desc')
      .firstOrFail()

    const absencesQuery = Absence.query()
      .select([
        'absences.id',
        'absences.class_student_id',
        'absences.schedule_id',
        'absences.status',
        'absences.reason',
        'absences.date',
        'students.name as student_name',
        'student_details.nisn as nisn',
        'student_details.nis as nis',
        'classes.name as class_name',
      ])
      .join('class_students', 'absences.class_student_id', 'class_students.id')
      .join('students', 'class_students.student_id', 'students.id')
      .join('student_details', 'students.id', 'student_details.student_id')
      .join('classes', 'class_students.class_id', 'classes.id')
      // .join('schedules', 'absences.schedule_id', 'schedules.id')
      // .join('academic_years', 'class_students.academic_year_id', 'academic_years.id')
      .if(params.nis, (query) => {
        query.where('student_details.nis', params.nis)
      })
      .if(params.tanggal, (query) => {
        query.where('absences.date', '=', params.tanggal)
      })
      .if(params.search, (query) => {
        query.where((subquery) => {
          subquery
            .where('students.name', 'like', `%${params.search}%`)
            .orWhere('student_details.nis', 'like', `%${params.search}%`)
            .orWhere('classes.name', 'like', `%${params.search}%`)
            .orWhere('absences.status', 'like', `%${params.search}%`)
            .orWhere('absences.reason', 'like', `%${params.search}%`)
        })
      })
      .if(params.kelas, (query) => {
        query.whereIn('classes.name', params.kelas)
      })

    // Sorting
    if (params.sortBy === 'kelas') {
      absencesQuery.orderBy('classes.name', params.sortOrder || 'asc')
    }
    if (params.sortBy === 'nis') {
      absencesQuery.orderBy('student_details.nis', params.sortOrder || 'asc')
    }
    if (params.sortBy === 'namaSiswa') {
      absencesQuery.orderBy('students.name', params.sortOrder || 'asc')
    }
    if (params.sortBy === 'tanggal') {
      absencesQuery.orderBy('absences.date', params.sortOrder || 'asc')
    }
    if (params.sortBy === 'status') {
      absencesQuery.orderBy('absences.status', params.sortOrder || 'asc')
    }
    if (params.sortBy === 'alasan') {
      absencesQuery.orderBy('absences.reason', params.sortOrder || 'asc')
    }

    absencesQuery
      .preload('schedule', (s) => {
        s.select(['id', 'class_id', 'days', 'start_time', 'end_time'])
      })
      .preload('classStudent', (cs) => {
        cs.select(['id', 'class_id', 'student_id', 'academic_year_id'])
        cs.preload('academicYear', (ay) => ay.select(['id', 'semester']))
        cs.preload('class', (c) => c.select(['id', 'name']))
        cs.preload('student', (s) => {
          s.select(['id', 'name'])
          s.preload('studentDetail', (sd) => sd.select(['nis', 'nisn']))
        })
      })

    const absences = await absencesQuery.paginate(params.page || 1, params.limit || 10)
    console.log('absences params:', params)
    return {
      firstSemester,
      secondSemester,
      absences: absences.toJSON(),
    }
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

  async getAbsencesBySchedule(studentId: number, scheduleId: number) {
    const schedule = await Schedule.findOrFail(scheduleId)

    const absences = Absence.query()
      .select('id', 'schedule_id', 'class_student_id', 'status', 'reason', 'date')
      .where('schedule_id', schedule.id)

    const activeAcademicYear = await this.activeSemester()

    const cs = await ClassStudent.query()
      .where('student_id', studentId)
      .where('academic_year_id', activeAcademicYear.id)
      .firstOrFail()

    console.log(
      '(absences services) student ID : ',
      studentId,
      'schedule ID : ',
      scheduleId,
      'class_student ID : ',
      cs.id
    )

    await absences.where('class_student_id', cs.id).preload('classStudent', (c) => {
      c.select(['id', 'class_id', 'student_id', 'academic_year_id'])
      c.preload('class', (cl) => cl.select(['id', 'name']))
      c.preload('student', (s) => {
        s.select(['id', 'name'])
        s.preload('studentDetail', (sd) => sd.select(['nis', 'nisn']))
      })
    })

    return absences
  }

  async create(data: any): Promise<any> {
    const absence = await Absence.create(data)
    return absence
  }
  async update(absenceId: number, data: any): Promise<any> {
    const absence = await Absence.query().where('id', absenceId).firstOrFail()
    return await absence.merge(data).save()
  }

  async delete(absenceId: number): Promise<any> {
    const absence = await Absence.query().where('id', absenceId).firstOrFail()
    return await absence.delete()
  }
}
