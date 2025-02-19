import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)

    return {
      user: user,
      token: token,
    }
  }

  async logout({ auth }: HttpContext) {
    const user = auth.user!

    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return {
      message: 'Log Out Berhasil',
    }
  }
}
