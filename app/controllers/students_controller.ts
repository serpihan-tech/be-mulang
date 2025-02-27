/* eslint-disable @typescript-eslint/no-shadow */
import type { HttpContext } from '@adonisjs/core/http'
import StudentContract from '../contracts/student_contract.js'
import Student from '#models/student'
import Schedule from '#models/schedule'
import auth from '@adonisjs/auth/services/main'
import Absence from '#models/absence'
import ClassStudent from '#models/class_student'

export default class StudentsController implements StudentContract {
  index(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async getPresenceSchedule({ auth, response }: HttpContext): Promise<void> {
    const student = await auth.user!.related('student').query().first()

    if (!student) {
      return response.notFound({ success: false, message: 'Siswa tidak ditemukan' })
    }

    const classStudent = await ClassStudent.query()
      .where('student_id', student.id)
      .select('class_id')
      .first()

    if (!classStudent) {
      return response.notFound({
        error: { success: false, message: 'Siswa belum terdaftar di kelas' },
      })
    }

    const schedule = await Schedule.query()
      .where('class_id', classStudent.class_id)
      .preload('module')
      .preload('room')

    // eslint-disable-next-line prettier/prettier
    const presence = await Absence.query()
        .where('class_student_id', student.id)

    return response.ok({
      success: true,
      message: 'Jadwal dan Presensi Ditemukan!',
      data: {
        schedule: schedule,
        presence: presence,
        totalPresence: presence.length,
      },
    })
  }
}
