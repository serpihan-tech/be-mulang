import AnnouncementByTeacher from '#models/announcement_by_teacher'
import db from '@adonisjs/lucid/services/db'
import { AnnouncementByTeacherContract } from '../contracts/announcement_contract.js'

export class AnnouncementByTeacherService implements AnnouncementByTeacherContract {
  async getAll(params: any): Promise<any> {
    const query = AnnouncementByTeacher.query()
      .preload('teacher', (teacher) => teacher.select('id', 'name', 'profilePicture'))
      .preload('schedule', (schedule) =>
        schedule.preload('class', (class_) =>
          class_.preload('teacher', (teacher) => teacher.select('id', 'name'))
        )
      )

    if (params.search) {
      query.where((q) => {
        q.where('title', 'like', `%${params.search}%`)
          .orWhere('content', 'like', `%${params.search}%`)
          .orWhere('date', 'like', `%${params.search}%`)
          .orWhereHas('teacher', (teacher) => teacher.where('name', 'like', `%${params.search}%`))
          .orWhereHas('schedule', (schedule) =>
            schedule.whereHas('class', (class_) =>
              class_.where('name', 'like', `%${params.search}%`)
            )
          )
      })
    }

    switch (params.sortBy) {
      case 'namaKelas':
        query
          .join('schedules', 'announcement_by_teachers.schedule_id', 'schedules.id')
          .join('classes', 'schedules.class_id', 'classes.id')
          .orderBy('classes.name', params.sortOrder || 'asc')
        break
      case 'namaPengirim':
        query
          .join('teachers', 'announcement_by_teachers.teacher_id', 'teachers.id')
          .orderBy('teachers.name', params.sortOrder || 'asc')
        break
      default:
        query.orderBy(params.sortBy || 'id', params.sortOrder || 'asc')
    }

    return await query.paginate(params.page, params.limit)
  }

  async getOne(id: number): Promise<any> {
    const result = await AnnouncementByTeacher.query().where('id', id).firstOrFail()
    return result
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    const result = await AnnouncementByTeacher.create(data, { client: trx })
    await trx.commit()
    return result
  }

  async update(data: any, id: number): Promise<any> {
    const trx = await db.transaction()
    const result = await AnnouncementByTeacher.findOrFail(id)
    result.merge(data)
    await result.useTransaction(trx).save()
    await trx.commit()
    return result
  }

  async delete(id: number): Promise<any> {
    const result = await AnnouncementByTeacher.findOrFail(id)
    await result.delete()
    return result
  }
}
