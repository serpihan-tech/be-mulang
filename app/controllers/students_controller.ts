import type { HttpContext } from '@adonisjs/core/http'
import StudentContract from '../contracts/student_contract.js'
import Student from '#models/student'
import Schedule from '#models/schedule'
import Absence from '#models/absence'
import ClassStudent from '#models/class_student'
import db from '@adonisjs/lucid/services/db'

export default class StudentsController implements StudentContract {
  /**
   * Mengambil data siswa dari pengguna yang sedang login.
   */
  async getStudent({ auth, response }: HttpContext): Promise<Student | null> {
    const user = auth.user
    if (!user) {
      response.unauthorized({ message: 'Unauthorized' })
      return null
    }
    return await user.related('student').query().first()
  }

  /**
   * Mengambil informasi kelas siswa berdasarkan student_id.
   */
  async getClassStudent(studentId: number): Promise<ClassStudent | null> {
    return await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'semester_id')
      .preload('semester')
      .preload('class')
      .first()
  }

  /**
   * Mengambil jadwal pelajaran berdasarkan studentId.
   */
  async getSchedule({ params, response }: HttpContext): Promise<any> {
    const studentId: number = params.studentId

    if (!studentId) {
      return response.badRequest({ error: { message: 'id siswa tidak ditemukan' } })
    }

    const classStudent = await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'semester_id')
      .preload('semester')
      .preload('class')
      .first()

    if (!classStudent) {
      return response.notFound({ error: { message: 'Kelas siswa tidak ditemukan' } })
    }

    const schedule = await Schedule.query()
      .where('class_id', classStudent.class_id)
      .preload('module')
      .preload('room')

    return response.ok(schedule)
  }

  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   */
  async getPresence({ params }: HttpContext): Promise<Object> {
    const studentId: number = params.studentId

    const result = await Absence.query()
      .join('class_students', 'absences.class_student_id', '=', 'class_students.id')
      .join('students', 'class_students.student_id', '=', 'students.id')
      .where('class_students.student_id', studentId)
      .select(
        db.raw(`COUNT(*) as total`),
        db.raw(`COUNT(CASE WHEN absences.status = 'Hadir' THEN 1 END) as hadir`),
        db.raw(
          `COUNT(CASE WHEN absences.status IN ('Sakit', 'Izin', 'Alfa') THEN 1 END) as tidak_hadir`
        )
      )
      .first()

    if (!result) {
      return {
        message: 'Data presensi siswa tidak ditemukan / hasilnya 0',
        total: 0,
        hadir: 0,
        tidak_hadir: 0,
      }
    }

    return {
      message: 'Data presensi siswa berhasil ditemukan',
      total: result.$extras.total ?? 0,
      hadir: result.$extras.hadir ?? 0,
      tidak_hadir: result.$extras.tidak_hadir ?? 0,
    }
  }
}
