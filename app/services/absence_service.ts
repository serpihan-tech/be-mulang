import Absence from '#models/absence'
import AcademicYear from '#models/academic_year'
import Student from '#models/student'
import AbsenceContract from '../contracts/absence_contract.js'
import Database from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import ModelFilter from '../utils/filter_query.js'

export class AbsenceService implements AbsenceContract {
  // TODO : Implement
  getById(absenceId: number): Promise<any> {
    const absence = Absence.query().where('id', absenceId).firstOrFail()
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

    // Ambil semester kedua (status true yang paling akhir)
    const secondSemester = await AcademicYear.query()
      .where('status', true)
      .orderBy('date_start', 'desc')
      .firstOrFail()

    // console.log(params.date)
    const absences = await Absence.filter(params)
      .select(['id', 'class_student_id', 'schedule_id', 'status', 'reason', 'date'])
      .if(params.nis, (query: any) => {
        query.whereIn('class_student_id', (subquery: any) => {
          subquery
            .from('class_students')
            .innerJoin('students', 'students.id', 'class_students.student_id')
            .innerJoin('student_details', 'student_details.student_id', 'students.id')
            .select('class_students.id')
            .where('student_details.nis', params.nis)
        })
      })
      .preload('schedule', (s: any) => {
        s.select(['id', 'class_id', 'days', 'start_time', 'end_time'])
      })
      .preload('classStudent', (cs: any) => {
        cs.select(['id', 'class_id', 'student_id', 'academic_year_id'])
        cs.preload('academicYear', (ay: any) => ay.select(['id', 'semester']))
        cs.preload('class', (c: any) => c.select(['name']))
        cs.preload('student', (s: any) => {
          s.select(['id', 'name'])
          s.preload('studentDetail', (sd: any) => sd.select(['nis', 'nisn']))
        })
      })
      .paginate(params.page || 1, params.limit)

    return {
      firstSemester,
      secondSemester,
      absences,
    }
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
