import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'

export default class AuthController {
  async login({ request }: HttpContext) {
    const { email, password, username } = request.only(['email', 'password', 'username'])

    if (!username) {
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)

      const role = await User.getRole(user)
      const data = await this.getProfile(role, user)

      return {
        message: 'Login Berhasil',
        role: role?.role,
        data,
        token: token,
      }
    }
    if (!email) {
      const user = await User.verifyCredentials(username, password)
      const token = await User.accessTokens.create(user)

      const role = await User.getRole(user)
      const data = await this.getProfile(role, user)

      return {
        message: 'Login Berhasil',
        role: role?.role,
        data,
        token: token,
      }
    }
  }

  async getProfile(role: Role, user: User) {
    let profile
    let details

    switch (role?.role) {
      case 'admin':
        profile = await user.related('admin').query().first()
        break
      case 'teacher':
        profile = await user.related('teacher').query().first()
        break
      case 'student':
        profile = await user.related('student').query().first()
        details = await profile?.related('studentDetail').query().first()
        break
    }

    return {
      user,
      profile: {
        ...profile?.serialize(),
        details: details,
      },
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
