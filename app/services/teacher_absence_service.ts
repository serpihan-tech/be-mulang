import Teacher from '#models/teacher'
import TeacherAbsence from '#models/teacher_absence'
import TeacherAbsenceContract from '../contracts/teacher_absence_contract.js'

export class TeacherAbsenceService implements TeacherAbsenceContract {
  async getAll(params: any): Promise<any> {
    const now = new Date()
    now.setHours(7, 0, 0, 0)

    // console.log(now)

    const teacherAbsence = await Teacher.query()
      .if(params.search, (query) =>
        query
          .where('name', 'like', `%${params.search}%`)
          .orWhere('nip', 'like', `%${params.search}%`)
      )
      .whereHas('latestAbsence', (la) => {
        la.where('date', params.date ?? now)
          .if(params.status, (q) => q.where('status', params.status))
          .if(params.sortBy, (q) => q.orderBy(params.sortBy, params.sortOrder || 'asc'))
      })
      .if(params.nip && params.nip !== '', (query) => query.where('nip', 'like', `%${params.nip}%`))
      .if(params.sortBy, (query) => query.orderBy(params.sortBy, params.sortOrder || 'asc'))
      .preload('latestAbsence', (ab) => {
        ab.where('date', params.date ?? now)
          .if(params.status, (query) => query.where('status', params.status))
          .if(params.sortBy, (query) => query.orderBy(params.sortBy, params.sortOrder || 'asc'))
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
