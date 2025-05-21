import Teacher from '#models/teacher'
import TeacherAbsence from '#models/teacher_absence'
import { DateTime } from 'luxon'
// import db from '@adonisjs/lucid/services/db'
import TeacherAbsenceContract from '../contracts/teacher_absence_contract.js'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'

export class TeacherAbsenceService implements TeacherAbsenceContract {
  async getAll(params: any): Promise<any> {
    const now = new Date()
    now.setHours(7, 0, 0, 0)

    const tanggal = DateTime.fromISO(params.tanggal).toISODate() ?? now
    console.log('tanggal guru absensi : ', tanggal)
    const teacherAbsence = await Teacher.query()

      .leftJoin('teacher_absences', (join) => {
        join.on('teacher_absences.teacher_id', '=', 'teachers.id')
        join.andOnVal('teacher_absences.date', '=', tanggal)
      })

      .if(params.search, (query) =>
        query
          .where('teachers.name', 'like', `%${params.search}%`)
          .orWhere('teachers.nip', 'like', `%${params.search}%`)
      )

      .if(params.nip && params.nip !== '', (query) =>
        query.where('teachers.nip', 'like', `%${params.nip}%`)
      )

      .if(params.sortBy === 'nama', (query) =>
        query.orderBy('teachers.name', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'nip', (query) =>
        query.orderBy('teachers.nip', params.sortOrder || 'asc')
      )

      .if(params.sortBy === 'status', (query) =>
        query.orderBy('teacher_absences.status', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'jamMasuk', (query) =>
        query.orderBy('teacher_absences.check_in_time', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'jamPulang', (query) =>
        query.orderBy('teacher_absences.check_out_time', params.sortOrder || 'asc')
      )

      .select('teachers.*')
      .groupBy('teachers.id')
      .preload('user', (u) => u.select('email'))
      .preload('latestAbsence', (ab) => {
        ab.where('date', tanggal).if(params.status, (query) => query.where('status', params.status))
      })

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
    const trx = await db.transaction()
    try {
      const teacherAbsence = await TeacherAbsence.create(
        {
          teacherId: data.teacher_id,
          date: data.date,
          status: data.status,
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
        },
        { client: trx }
      )

      if (data.in_photo) {
        const latestPhoto = data.in_photo
        const teacher = await Teacher.query().where('id', 3).firstOrFail()
        const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')

        const fileName = `${teacherName}.${data.date}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${data.date}/check-in-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        // Simpan path file ke dalam database
        teacherAbsence.inPhoto = `teacher-absences/${data.date}/check-in-photos/${fileName}`
      }

      if (data.out_photo) {
        const latestPhoto = data.out_photo
        const teacher = await Teacher.query().where('id', 3).firstOrFail()
        const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')

        const fileName = `${teacherName}.${data.date}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${data.date}/check-out-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        // Simpan path file ke dalam database
        teacherAbsence.outPhoto = `teacher-absences/${data.date}/check-out-photos/${fileName}`
      }

      await teacherAbsence.save()
      await trx.commit()

      return teacherAbsence
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(teacherAbsenceId: number, data: any): Promise<Object> {
    const trx = await db.transaction()
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()

    // console.log('dateInput : ', teacherAbsence.date)

    try {
      console.log('teacherAbsence : ', teacherAbsence)
      await teacherAbsence
        .merge({
          date: data.date ?? teacherAbsence.date,
          status: data.status,
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
        })
        .save()

      const teacher = await Teacher.query().where('id', teacherAbsence.teacherId).firstOrFail()
      const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')
      const dateInput = data.date ?? teacherAbsence.date.toISOString().split('T')[0]

      if (data.in_photo) {
        const latestPhoto = data.in_photo
        const fileName = `${teacherName}.${dateInput}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${dateInput}/check-in-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        teacherAbsence.inPhoto = `teacher-absences/${dateInput}/check-in-photos/${fileName}`
      }

      if (data.out_photo) {
        const latestPhoto = data.out_photo
        const fileName = `${teacherName}.${dateInput}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${dateInput}/check-out-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        teacherAbsence.outPhoto = `teacher-absences/${dateInput}/check-out-photos/${fileName}`
      }

      await teacherAbsence.save()
      await trx.commit()

      return teacherAbsence
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(teacherAbsenceId: number): Promise<void> {
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()

    await teacherAbsence.delete()
  }

  async presenceToday(teacherId: number) {
    const now = DateTime.local().toISODate()

    // console.log('presenceToday : ', now)
    const teacherAbsence = await TeacherAbsence.query()
      .where('teacher_id', teacherId)
      .where('date', now)
      .first()

    // console.log('teacherAbsence : ', teacherAbsence)
    return teacherAbsence
  }
}
