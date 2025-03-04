import Student from '#models/student'
import Schedule from '#models/schedule'
import Absence from '#models/absence'
import ClassStudent from '#models/class_student'
import db from '@adonisjs/lucid/services/db'
import StudentContract from '../contracts/student_contract.js'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import StudentDetail from '#models/student_detail'

export default class StudentsService implements StudentContract, UserContract {
  async index(page: number): Promise<any> {
    const pages = page
    const limit = 10

    return await Student.query()
      .where('is_graduate', false)
      .preload('user')
      .preload('studentDetail')
      .preload('classStudent', (cs) => {
        cs.preload('class')
        cs.preload('semester')
      })
      .paginate(pages, limit)
  }

  async show(id: number): Promise<any> {
    return await Student.query()
      .where('id', id)
      .preload('user')
      .preload('studentDetail')
      .preload('classStudent', (cs) => {
        cs.preload('class')
        cs.preload('semester')
      })
      .firstOrFail()
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()

    try {
      const user = await User.create(data.user, { client: trx })

      await User.assignRole(user, 'student')

      const student = await Student.create(
        {
          user_id: user.id,
          name: data.student.name,
          is_graduate: data.student.is_graduate,
        },
        { client: trx }
      )

      await StudentDetail.create(
        {
          student_id: student.id,
          ...data.student_detail,
        },
        { client: trx }
      )

      await student.useTransaction(trx).load('user')
      await student.useTransaction(trx).load('studentDetail')

      await trx.commit()
      return student
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(studentId: number, data: any): Promise<any> {
    const trx = await db.transaction()

    try {
      const student = await Student.query({ client: trx })
        .where('id', studentId)
        .preload('user')
        .preload('studentDetail')
        .firstOrFail()

      if (data.user) {
        student.user.merge({
          email: data.user.email ?? student.user.email,
          username: data.user.username ?? student.user.username,
          password: data.user.password ?? student.user.password,
        })
        await student.user.save()
      }

      if (data.student) {
        student.merge({
          name: data.student.name ?? student.name,
          is_graduate: data.student.is_graduate ?? student.is_graduate,
        })
        await student.save()
      }

      if (data.student_detail && student.studentDetail) {
        student.studentDetail.merge({
          nis: data.student_detail.nis ?? student.studentDetail.nis,
          nisn: data.student_detail.nisn ?? student.studentDetail.nisn,
          gender: data.student_detail.gender ?? student.studentDetail.gender,
          birth_date: data.student_detail.birth_date ?? student.studentDetail.birth_date,
          birth_place: data.student_detail.birth_place ?? student.studentDetail.birth_place,
          address: data.student_detail.address ?? student.studentDetail.address,
          enrollment_year:
            data.student_detail.enrollment_year ?? student.studentDetail.enrollment_year,
          parents_name: data.student_detail.parents_name ?? student.studentDetail.parents_name,
          parents_phone: data.student_detail.parents_phone ?? student.studentDetail.parents_phone,
          parents_job: data.student_detail.parents_job ?? student.studentDetail.parents_job,
          students_phone:
            data.student_detail.students_phone ?? student.studentDetail.students_phone,
        })
        await student.studentDetail.save()
      }

      await trx.commit()

      await student.load('user')
      await student.load('studentDetail')

      return student
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(user: User): Promise<any> {
    return await user.delete()
  }

  /**
   * Mengambil informasi kelas siswa berdasarkan student_id.
   */
  async getClassStudent(studentId: number) {
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
  async getSchedule(studentId: number): Promise<any[]> {
    if (!studentId) throw new Error('ID siswa tidak ditemukan')

    const classStudent = await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'semester_id')
      .preload('semester')
      .preload('class')
      .first()

    if (!classStudent) throw new Error('Kelas siswa tidak ditemukan')

    return await Schedule.query()
      .where('class_id', classStudent.class_id)
      .preload('module')
      .preload('room')
  }

  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   */
  async getPresence(studentId: number) {
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
      message: result
        ? 'Data presensi siswa berhasil ditemukan'
        : 'Data presensi siswa tidak ditemukan / hasilnya 0',
      total: result?.$extras.total ?? 0,
      hadir: result?.$extras.hadir ?? 0,
      tidak_hadir: result?.$extras.tidak_hadir ?? 0,
    }
  }
}
