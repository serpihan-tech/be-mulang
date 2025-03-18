import Teacher from '#models/teacher'
import db from '@adonisjs/lucid/services/db'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import ModelFilter from '../utils/filter_query.js'

export default class TeacherService implements UserContract {
  async index(params: any, page?: number, limit?: number): Promise<any> {
    const teachers = await Teacher.filter(params)
      .preload('user')
      .whereHas('user', (userQuery) => {
        userQuery.where('email', 'LIKE', `%${params.email}%`)
      })
      .paginate(page || 1, limit)
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
        profilePicture: data.teacher?.profile_picture ?? teacher.profilePicture,
      })
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
