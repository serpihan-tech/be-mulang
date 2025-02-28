import { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import Schedule from '#models/schedule'
import ClassStudent from '#models/class_student'
import db from '@adonisjs/lucid/services/db'

export default class StudentDashboardService {
  /**
   * @param auth
   * @info Ambil data siswa dari user yang sedang login
   */
  private async getStudent({ auth }: HttpContext) {
    return await auth.user!.related('student').query().first()
  }

  /**
   * @param studentId
   * @info Ambil data kelas siswa berdasarkan student_id
   */
  private async getClassStudent(studentId: number) {
    const classStudent = await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'semester_id')
      .preload('semester')
      .preload('class')
      .first()

    // console.log(classStudent?.toJSON())
    return classStudent
  }

  /**
   * @param classId
   * @info Ambil jadwal berdasarkan class_id
   */
  private async getSchedule(classId: number) {
    return await Schedule.query().where('class_id', classId).preload('module').preload('room')
  }

  /**
   * @param studentId
   * @info Ambil data presensi berdasarkan student_id
   */
  private async getPresence(studentId: number) {
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

    return {
      total: result?.$extras.total ?? 0,
      hadir: result?.$extras.hadir ?? 0,
      tidak_hadir: result?.$extras.tidak_hadir ?? 0,
    }
  }

  /**
   * @info Dashboard untuk siswa
   */
  public async dashboardStudent(ctx: HttpContext): Promise<void> {
    const { response } = ctx

    const student = await this.getStudent(ctx)
    if (!student) {
      return response.notFound({
        error: { success: false, message: 'Siswa tidak ditemukan' },
      })
    }

    const classStudent = await this.getClassStudent(student.id)
    if (!classStudent) {
      return response.notFound({
        error: { success: false, message: 'Siswa belum terdaftar di kelas' },
      })
    }

    const schedule = await this.getSchedule(classStudent.class_id)
    const presence = await this.getPresence(student.id)

    return response.ok({
      success: true,
      message: 'Jadwal dan Presensi Ditemukan!',
      data: {
        schedule,
        class: classStudent?.class,
        semester: classStudent?.semester,
        totalPresence: presence,
      },
    })
  }
}
