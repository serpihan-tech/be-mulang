import AnnouncementByTeacher from '#models/announcement_by_teacher'
import db from '@adonisjs/lucid/services/db'
import { AnnouncementByTeacherContract } from '../contracts/announcement_contract.js'
import transmit from '@adonisjs/transmit/services/main'
import Class from '#models/class'
import Schedule from '#models/schedule'
import Module from '#models/module'
import User from '#models/user'
import Teacher from '#models/teacher'
import { DateTime } from 'luxon'

export class AnnouncementByTeacherService implements AnnouncementByTeacherContract {
  protected now =
    DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  async getAll(params: any, role?: string): Promise<any> {
    // console.log('params announcement by teacher service (getAll) : ', params)
    const query = AnnouncementByTeacher.query()
      .if(role === 'teacher', (q) => q.where('teacher_id', params.teacher_id))
      .preload('teacher', (teacher) => teacher.select('id', 'name', 'profilePicture'))
      .preload('class', (cl) => cl.preload('teacher', (tc) => tc.select('id', 'name')))
      .preload('module', (m) => m.select('id', 'name'))

    if (params.tanggal) {
      query.where('date', params.tanggal)
    }

    if (params.search) {
      query.where((q) => {
        q.where('title', 'like', `%${params.search}%`)
          .orWhere('content', 'like', `%${params.search}%`)
          .orWhere('date', 'like', `%${params.search}%`)
          .orWhereHas('teacher', (teacher) => teacher.where('name', 'like', `%${params.search}%`))
          .orWhereHas('class', (cl) => cl.where('name', 'like', `%${params.search}%`))
      })
    }

    if (params.kelas) {
      query.whereHas('class', (cl) => cl.where('name', params.kelas))
    }

    switch (params.sortBy) {
      case 'kelas':
        query
          .join('classes', 'announcement_by_teachers.class_id', 'classes.id')
          .orderBy('classes.name', params.sortOrder || 'asc')
        break
      case 'guru':
        query
          .join('teachers', 'announcement_by_teachers.teacher_id', 'teachers.id')
          .orderBy('teachers.name', params.sortOrder || 'asc')
        break
      default:
        query.orderBy(params.sortBy || 'id', params.sortOrder || 'asc')
    }

    let announcement

    if (params.noPaginate) {
      return await query
    }

    announcement = await query.paginate(params.page || 1, params.limit || 10)

    console.log('ANNOUNCEMENT BY TEACHERS INDEX : ', query)
    return announcement
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
        classId: data.class_id,
        moduleId: data.module_id,
        title: data.title,
        content: data.content,
        category: 'Akademik',
        date: data.date,
        files: data.files,
      },
      { client: trx }
    )
    await trx.commit()

    const mapel = await Module.query().where('id', result.moduleId).firstOrFail()
    const kelas = await Class.query().where('id', result.classId).firstOrFail()

    const teacher = await Teacher.query().where('id', result.teacherId).firstOrFail()
    const role = await User.getRole(await teacher.related('user').query().firstOrFail())

    if (result.date.toISOString() === this.now) {
      const ann = transmit.broadcast(`notifications/teachers/class/${kelas.id}`, {
        message: {
          title: result.title,
          content: result.content,
          category: result.category,
          role: role?.role,
          date: result.date.toISOString(),
          // files: result.files,
          module: mapel.name,
          class: kelas.name,
        },
      })
    }

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
