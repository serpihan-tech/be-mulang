import AnnouncementByTeacher from '#models/announcement_by_teacher'
import db from '@adonisjs/lucid/services/db'
import { AnnouncementByTeacherContract } from '../contracts/announcement_contract.js'
import transmit from '@adonisjs/transmit/services/main'
import Class from '#models/class'
import Schedule from '#models/schedule'
import Module from '#models/module'
import User from '#models/user'
import Teacher from '#models/teacher'

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
    const result = await AnnouncementByTeacher.create(
      {
        teacherId: data.teacher_id,
        scheduleId: data.schedule_id,
        title: data.title,
        content: data.content,
        category: 'Akademik',
        date: data.date,
        files: data.files,
      },
      { client: trx }
    )
    await trx.commit()

    const mapel = await Module.query().where('id', result.schedule.moduleId).firstOrFail()
    const kelas = await Class.query().where('id', result.schedule.classId).firstOrFail()

    const teacher = await Teacher.query().where('id', result.teacherId).firstOrFail()
    const role = await User.getRole(await teacher.related('user').query().firstOrFail())

    const ann = transmit.broadcastExcept(
      `notifications/${kelas.name}`,
      {
        message: {
          title: result.title,
          content: result.content,
          category: result.category,
          role: role?.role,
          date: result.date.toISOString(),
          files: result.files,
          module: mapel.name,
          class: kelas.name,
        },
      },
      result.teacher.id.toString()
    )

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
