import Teacher from '#models/teacher'
import db from '@adonisjs/lucid/services/db'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import ClassStudent from '#models/class_student'
import Schedule from '#models/schedule'
import AcademicYear from '#models/academic_year'
import { DateTime } from 'luxon'
import { unlink } from 'node:fs/promises'
import { join as joinPath } from 'node:path'

export default class TeacherService implements UserContract {
  async index(params: any, page?: number, limit?: number): Promise<any> {
    const lim = Number(limit) || 10
    const pg = Number(page) || 1

    const sortBy = params.sortBy
    const sortOrder = params.sortOrder

    const teachers = await Teacher.query()
      .if(params.search, (q) =>
        q
          .where('name', 'like', `%${params.search}%`)
          .orWhere('nip', 'like', `%${params.search}%`)
          .orWhere('phone', 'like', `%${params.search}%`)
          .orWhereHas('user', (user) => user.where('email', 'like', `%${params.search}%`))
      )
      .if(sortBy === 'nama', (qs) => qs.orderBy('name', sortOrder || 'asc'))
      .if(sortBy === 'nip', (qs) => qs.orderBy('nip', sortOrder || 'asc'))
      .if(sortBy === 'noTelp', (qs) => qs.orderBy('phone', sortOrder || 'asc'))
      .if(sortBy === 'email', (qs) =>
        qs
          .join('users', 'teachers.user_id', '=', 'users.id')
          .orderBy('users.email', sortOrder || 'asc')
          .select('teachers.*')
      )
      .preload('user')
      .paginate(pg, lim)

    return teachers
  }

  async getIdName(): Promise<any> {
    const teachers = await Teacher.query().select('id', 'name')
    // console.log('teachers : ', teachers)
    return teachers
  }

  async show(id: number): Promise<any> {
    const teacher = await Teacher.query().where('id', id).preload('user').firstOrFail()
    return teacher
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const user = await User.create(data.user, { client: trx })

      await User.assignRole(user, 'teacher')

      const teacher = await Teacher.create(
        {
          user_id: user.id,
          ...data.teacher,
        },
        { client: trx }
      )

      if (data.teacher.profile_picture) {
        const profilePicture = data.student_detail.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/teachers-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        teacher.profilePicture = `teachers-profile/${fileName}`
      }

      await teacher.save()

      await trx.commit()
      return teacher
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(id: number, data: any): Promise<any> {
    const trx = await db.transaction()

    try {
      const teacher = await Teacher.query({ client: trx })
        .where('id', id)
        .preload('user')
        .forUpdate()
        .firstOrFail()

      if (teacher.user) {
        teacher.user.merge({
          email: data.user?.email ?? teacher.user.email,
          username: data.user?.username ?? teacher.user.username,
          password: data.user?.password ?? teacher.user.password,
        })
        await teacher.user.useTransaction(trx).save()
      }

      teacher.merge({
        name: data.teacher?.name ?? teacher.name,
        nip: data.teacher?.nip ?? teacher.nip,
        phone: data.teacher?.phone ?? teacher.phone,
        religion: data.teacher?.religion ?? teacher.religion,
        birthDate: data.teacher?.birth_date ?? teacher.birthDate,
        birthPlace: data.teacher?.birth_place ?? teacher.birthPlace,
        gender: data.teacher?.gender ?? teacher.gender,
        address: data.teacher?.address ?? teacher.address,
      })

      if (data.teacher.profile_picture) {
        const profilePicture = data.teacher.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/teachers-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        teacher.profilePicture = `teachers-profile/${fileName}`
      }

      await teacher.save()

      await trx.commit()
      return teacher
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number): Promise<any> {
    const teacher = await Teacher.query().where('id', id).preload('user').firstOrFail()
    const { profilePicture } = teacher

    const UPLOADS_PATH = app.makePath('storage/uploads') // D:\...\storage\uploads

    if (profilePicture) {
      const fullInPhotoPath = joinPath(UPLOADS_PATH, profilePicture)
      // console.log('Full inPhoto path:', fullInPhotoPath)
      await unlink(fullInPhotoPath)
    }

    return await teacher?.user.delete()
  }

  async getCountStudentsAndClasses(teacherId: number, params?: any): Promise<any> {
    const activeSemester = await this.getActiveSemester()
    const tahunAjar = params.tahunAjar ?? activeSemester.id

    const schedules = await Schedule.query().whereHas('module', (m) =>
      m.where('teacher_id', teacherId).where('academic_year_id', tahunAjar)
    )

    const classIds = schedules.map((item) => item.classId)
    const uniqueClassIds = [...new Set(classIds)]
    const totalClasses = uniqueClassIds.length

    console.log('uniqueClassIds : ', uniqueClassIds)
    console.log('classIds : ', classIds)
    const studentsCount = await ClassStudent.query()
      .where('academic_year_id', tahunAjar)
      .whereIn('class_id', uniqueClassIds)
      .countDistinct('student_id as total_students')

    return {
      totalClasses,
      totalStudents: Number(studentsCount[0].$extras.total_students),
    }
  }

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
}
