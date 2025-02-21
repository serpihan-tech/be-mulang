import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password, username } = request.only(['email', 'password', 'username'])

    if (!username) {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      return {
        message: 'Login Berhasil',
        user: user,
        token: token,
      }
    }
    if (!email) {
      const user = await User.verifyCredentials(username, password)
      const token = await User.accessTokens.create(user)

      return {
        message: 'Login Berhasil',
        user: user,
        token: token,
      }
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
