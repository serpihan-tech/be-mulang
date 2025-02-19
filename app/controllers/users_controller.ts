import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/user'

export default class UsersController {
  async index({}: HttpContext) {
    return 'hello'
  }
  async create({ request }: HttpContext) {
    const user = new User()
    user.username = request.input('username')
    user.email = request.input('email')
    user.password = request.input('password')

    await createUserValidator.validate(user)
    await user.save()

    return {
      message: 'Pengguna Berhasil Ditambahkan',
      user,
    }
  }
}
