import AnnouncementByTeacher from '#models/announcement_by_teacher'
import db from '@adonisjs/lucid/services/db'
import { AnnouncementByTeacherContract } from '../contracts/announcement_contract.js'

export class AnnouncementByTeacherService implements AnnouncementByTeacherContract {
  async getAll(params: any): Promise<any> {
    const result = await AnnouncementByTeacher.filter(params)
      .preload('teacher')
      .preload('schedule')
      .paginate(1, 10)

    return result
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
