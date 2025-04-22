import Teacher from '#models/teacher'
import TeacherAbsence from '#models/teacher_absence'
import db from '@adonisjs/lucid/services/db'
import TeacherAbsenceContract from '../contracts/teacher_absence_contract.js'

export class TeacherAbsenceService implements TeacherAbsenceContract {
  async getAll(params: any): Promise<any> {
    const now = new Date()
    now.setHours(7, 0, 0, 0)

    const tanggal = params.tanggal ?? now

    const teacherAbsence = await Teacher.query()
      // LEFT JOIN ke table absensi berdasarkan tanggal yang dipilih
      .leftJoin('teacher_absences', (join) => {
        join.on('teacher_absences.teacher_id', '=', 'teachers.id')
        join.andOnVal('teacher_absences.date', '=', tanggal)
      })

      // Filter pencarian nama atau nip
      .if(params.search, (query) =>
        query
          .where('teachers.name', 'like', `%${params.search}%`)
          .orWhere('teachers.nip', 'like', `%${params.search}%`)
      )

      .if(params.nip && params.nip !== '', (query) =>
        query.where('teachers.nip', 'like', `%${params.nip}%`)
      )

      // Sorting bawaan berdasarkan kolom tabel guru
      .if(params.sortBy === 'nama', (query) =>
        query.orderBy('teachers.name', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'nip', (query) =>
        query.orderBy('teachers.nip', params.sortOrder || 'asc')
      )

      // Sorting berdasarkan kolom relasi yang di-join
      .if(params.sortBy === 'status', (query) =>
        query.orderBy('teacher_absences.status', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'jamMasuk', (query) =>
        query.orderBy('teacher_absences.check_in_time', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'jamPulang', (query) =>
        query.orderBy('teacher_absences.check_out_time', params.sortOrder || 'asc')
      )

      // Select hanya kolom guru (hindari kolom duplikat dari join)
      .select('teachers.*')

      // Preload relasi untuk ambil detail absensi
      .preload('latestAbsence', (ab) => {
        ab.where('date', tanggal).if(params.status, (query) => query.where('status', params.status))
      })

      // Pagination
      .paginate(params.page || 1, params.limit || 10)

    // console.log(await TeacherAbsence.query().where('id', 12).firstOrFail())
    return teacherAbsence
  }

  async getOne(teacherAbsenceId: number): Promise<Object> {
    const teacherAbsence = await TeacherAbsence.query()
      .where('id', teacherAbsenceId)
      .preload('teacher', (t) =>
        t.select('id', 'user_id', 'name', 'nip', 'phone').preload('user', (u) => u.select('email'))
      )
      .firstOrFail()

    return teacherAbsence
  }

  async create(data: any): Promise<Object> {
    const teacherAbsence = await TeacherAbsence.create(data)

    return teacherAbsence
  }

  async update(teacherAbsenceId: number, data: any): Promise<Object> {
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()

    return await teacherAbsence.merge(data).save()
  }

  async delete(teacherAbsenceId: number): Promise<void> {
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()

    await teacherAbsence.delete()
  }

  async presenceToday(teacherId: number) {
    const now = new Date()
    now.setHours(7, 0, 0, 0)

    console.log('presenceToday : ', now)
    const teacherAbsence = await TeacherAbsence.query()
      .where('teacher_id', teacherId)
      .where('date', now)
      .first()

    return teacherAbsence
  }
}
