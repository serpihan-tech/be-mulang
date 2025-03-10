import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import AcademicYear from '#models/academic_year'

export default class AuthController {
  async checkRole({ request, response }: HttpContext) {
    const { email, password, username } = request.only(['email', 'password', 'username'])

    if (!username) {
      const user = await User.verifyCredentials(email, password)
      const role = await User.getRole(user)
      return response.ok({ role: role?.role })
    }
    if (!email) {
      const user = await User.verifyCredentials(username, password)
      const role = await User.getRole(user)
      return response.ok({ role: role?.role })
    }
  }

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

  async activeSemester() {
    const now = new Date()

    const activeSemester = await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()

    return activeSemester.id
  }

  async getProfile(role: Role, user: User) {
    let profile
    let details
    let classStudent

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
        classStudent = await profile
          ?.related('classStudent')
          .query()
          .where('academic_year_id', await this.activeSemester())
          .preload('class', (c) => c.select('id', 'name'))
          .firstOrFail()
        break
    }

    return {
      user,
      profile: {
        ...profile?.serialize(),
        details: { ...details?.serialize(), classStudent },
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
