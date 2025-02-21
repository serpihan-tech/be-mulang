import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Teacher from '#models/teacher'

import { createUserValidator } from '#validators/user'
import { createTeacherValidator } from '#validators/teacher'
import db from '@adonisjs/lucid/services/db'

export default class TeachersController {
  async index({ response }: HttpContext) {
    try {
      const teachers = await Teacher.all()
      return response.ok({
        message: 'Berhasil Mendapatkan Data Guru',
        teachers,
      })
    } catch (error) {
      return error
    }
  }

  async create({ request, response }: HttpContext) {
    const trx = await db.transaction()

    try {
      const user = new User()
      user.username = request.input('username')
      user.email = request.input('email')
      user.password = request.input('password')

      await createUserValidator.validate(user)

      const teacher = new Teacher()
      teacher.user_id = user.id
      teacher.name = request.input('name')
      teacher.nip = request.input('nip')
      teacher.phone = request.input('phone')
      teacher.address = request.input('address')
      teacher.profile_picture = request.input('profile_picture')

      await createTeacherValidator.validate(teacher)

      trx.commit()

      return response.created({
        messages: 'Pengguna dan Guru Berhasil Ditambahkan',
        user,
        teacher,
      })
    } catch (error) {
      trx.rollback()
      return error
    }
  }
}
