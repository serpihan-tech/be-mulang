import AnnouncementByTeacher from '#models/announcement_by_teacher'
import db from '@adonisjs/lucid/services/db'
import { AnnouncementByTeacherContract } from '../contracts/announcement_contract.js'
import transmit from '@adonisjs/transmit/services/main'
import Class from '#models/class'
import Module from '#models/module'
import User from '#models/user'
import Teacher from '#models/teacher'
import ClassStudent from '#models/class_student'
import { DateTime } from 'luxon'
import app from '@adonisjs/core/services/app'
import { unlink } from 'node:fs/promises'
import { join as joinPath } from 'node:path'
import AcademicYear from '#models/academic_year'

export class AnnouncementByTeacherService implements AnnouncementByTeacherContract {
  protected now =
    DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd 00:00:00.000 +07:00') ?? // DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  private async getActiveSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(now)

    return await AcademicYear.query()
      .where('status', 1 || true)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }

  async getAll(params: any, role?: string): Promise<any> {
    const activeSemester = await this.getActiveSemester()
    let cs: any
    if (role === 'student') {
      cs = await ClassStudent.query()
        .where('student_id', params.student_id)
        .where('academic_year_id', activeSemester.id)
        .first()
    }

    const query = AnnouncementByTeacher.query()
      .if(role === 'teacher', (q) => q.where('teacher_id', params.teacher_id))
      .if(role === 'student' && cs, (q) => q.where('class_id', cs.class_id))
      .preload('teacher', (teacher) => teacher.select('id', 'name', 'profilePicture'))
      .preload('class', (cl) => cl.preload('teacher', (tc) => tc.select('id', 'name')))
      .preload('module', (m) => m.select('id', 'name'))
      .where('date', '<=', this.now)

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
      case 'judul':
        query.orderBy('title', params.sortOrder || 'asc')
        break
      case 'deskripsi':
        query.orderBy('content', params.sortOrder || 'asc')
        break
      case 'tanggal':
        query.orderBy('date', params.sortOrder || 'asc')
        break
      case 'mapel':
        query
          .join('modules', 'announcement_by_teachers.module_id', 'modules.id')
          .orderBy('modules.name', params.sortOrder || 'asc')
          .select('announcement_by_teachers.*') // biar kolom aman
        break
      case 'kelas':
        query
          .join('classes', 'announcement_by_teachers.class_id', 'classes.id')
          .orderBy('classes.name', params.sortOrder || 'asc')
          .select('announcement_by_teachers.*') // biar kolom aman
        break
      // case 'guru':
      //   query
      //     .join('teachers', 'announcement_by_teachers.teacher_id', 'teachers.id')
      //     .orderBy('teachers.name', params.sortOrder || 'asc')
      //     .select('announcement_by_teachers.*')
      //   break
      default:
        query.orderBy(params.sortBy || 'id', params.sortOrder || 'asc')
    }

    if (params.noPaginate) {
      const data = await query
        .orderBy('date', 'desc')
        .orderBy('created_at', 'desc')
        .preload('teacher', (t) => t.preload('user'))

      return data.map((item) => ({
        id: `74${item.id}`,
        title: item.title,
        content: item.content,
        category: item.category,
        role: 'teacher',
        date: item.date.toISOString(),
        teacherName: item.teacher?.name ?? null,
        teacherEmail: item.teacher?.user?.email ?? null,
        teacherPicture: item.teacher?.profilePicture ?? null,
        moduleName: item.module?.name ?? null,
        className: item.class?.name ?? null,
        files: item.files,
        createdAt: item.createdAt.toString(),
        updatedAt: item.updatedAt.toString(),
      }))
    } else {
      const announcement = await query.paginate(params.page || 1, params.limit || 10)
      return announcement
    }
  }

  async getOne(id: number): Promise<any> {
    const result = await AnnouncementByTeacher.query().where('id', id).firstOrFail()
    return result
  }

  async create(data: any): Promise<any> {
    console.log('data announcemnet by teacher : ', data)
    const trx = await db.transaction()

    const file = data.files
    let filePath = ''
    let tempFilePath = ''

    try {
      if (file) {
        filePath = `announcement-teachers/${new Date().getTime()}_${file.clientName}`
        tempFilePath = `${new Date().getTime()}_${file.clientName}`
      }

      const result = await AnnouncementByTeacher.create(
        {
          teacherId: data.teacher_id,
          classId: Number(data.class_id) || data.class_id,
          moduleId: Number(data.module_id) || data.module_id,
          title: data.title,
          content: data.content,
          files: filePath,
          category: 'Akademik',
          date: data.date,
        },
        { client: trx }
      )

      if (file) {
        await file.move(app.makePath('storage/uploads/announcement-teachers'), {
          name: tempFilePath,
          overwrite: true,
        })
      }

      // await result.useTransaction(trx).save()
      await trx.commit()

      const resultDate = DateTime.fromISO(result.date.toString()).setZone('Asia/Jakarta').toSQL()
      console.log('resultDate : ', resultDate, 'this.now : ', this.now)

      if (resultDate === this.now) {
        const mapel = await Module.query().where('id', result.moduleId).firstOrFail()
        const kelas = await Class.query().where('id', result.classId).firstOrFail()

        const teacher = await Teacher.query()
          .where('id', result.teacherId)
          .preload('user')
          .firstOrFail()
        const role = await User.getRole(await teacher.related('user').query().firstOrFail())

        transmit.broadcast(`notifications/teachers/class/${kelas.id}`, {
          message: {
            id: `74${result.id}`,
            title: result.title,
            content: result.content,
            category: result.category,
            role: role?.role,
            date: result.date.toString(),
            from: teacher.name,
            module: mapel.name,
            class: kelas.name,
            files: result.files,
            senderPicture: teacher.profilePicture,
            senderEmail: teacher.user.email,
            createdAt: result.createdAt.toString(),
            updatedAt: result.updatedAt.toString(),
          },
        })

        return result
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(data: any, id: number): Promise<any> {
    const trx = await db.transaction()
    const file = data.files
    let filePath = ''
    let tempFilePath = ''

    try {
      const result = await AnnouncementByTeacher.findOrFail(id)

      if (file !== null) {
        filePath = `announcement-teachers/${new Date().getTime()}_${file.clientName}`
        tempFilePath = `${new Date().getTime()}_${file.clientName}`

        result.merge({
          ...data,
          files: filePath,
        })
      } else {
        result.merge(data)
      }

      await result.useTransaction(trx).save()
      await trx.commit()

      if (file) {
        await file.move(app.makePath('storage/uploads/announcement-teachers'), {
          name: tempFilePath,
          overwrite: true,
        })
      }

      return result
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number): Promise<any> {
    const result = await AnnouncementByTeacher.findOrFail(id)
    const { files } = result

    const UPLOADS_PATH = app.makePath('storage/uploads') // D:\...\storage\uploads

    if (files) {
      const fullInPhotoPath = joinPath(UPLOADS_PATH, files)
      // console.log('Full inPhoto path:', fullInPhotoPath)
      await unlink(fullInPhotoPath)
    }

    await result.delete()
    return result
  }
}
