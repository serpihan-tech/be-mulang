import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password, username } = request.only(['email', 'password', 'username'])

    if (!username) {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      const role = await User.getRole(user)

      return {
        message: 'Login Berhasil',
        user: user,
        role: role?.role,
        token: token,
      }
    }
    if (!email) {
      const user = await User.verifyCredentials(username, password)
      const token = await User.accessTokens.create(user)

      const role = await User.getRole(user)

      return {
        message: 'Login Berhasil',
        user: user,
        role: role?.role,
        token: token,
      }
    }
  }

  async logout({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    // const cek = await User.accessTokens.all(auth.user!)
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return {
      // user: cek,
      message: 'Log Out Berhasil',
    }
  }
}
