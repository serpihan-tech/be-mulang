import Teacher from '#models/teacher'
import db from '@adonisjs/lucid/services/db'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import ModelFilter from '../utils/filter_query.js'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class TeacherService implements UserContract {
  async index(params: any, page?: number, limit?: number): Promise<any> {
    const lim = Number(limit) || 10
    const pg = Number(page) || page || 1

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
    const student = await Teacher.query().where('id', id).preload('user').firstOrFail()
    return await student?.user.delete()
  }
}
