import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator, updatePasswordValidator } from '#validators/user'

export default class UsersController {
  async index({}: HttpContext) {
    return 'hello'
  }

  async create({ request, response }: HttpContext) {
    const user = new User()
    user.username = request.input('username')
    user.email = request.input('email')
    user.password = request.input('password')

    await createUserValidator.validate(user)
    await user.save()

    return response.created({
      message: 'Pengguna Berhasil Ditambahkan',
      user,
    })
  }

  async changePassword({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      const data = request.all()
      await updatePasswordValidator.validate(data)

      await User.verifyCredentials(user.email, data.oldPassword)

      const password = request.input('newPassword')

      user.password = password
      await user.save()

      return response.ok({
        message: 'Password Berhasil Diubah',
      })
    } catch (error) {
      if (error.code === 'E_INVALID_CREDENTIALS')
        return response.badRequest({
          error: {
            message: 'Password Lama Tidak Cocok',
            code: 'E_INVALID_CREDENTIALS',
            status: 400,
          },
        })
      return response.status(error.status).send({ error })
    }
  }
}
