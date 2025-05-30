import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import AcademicYear from '#models/academic_year'
import { errors as authErrors } from '@adonisjs/auth'
import { errors as lucidErrors } from '@adonisjs/lucid'
import limiter from '@adonisjs/limiter/services/main'
import { DateTime } from 'luxon'
import Teacher from '#models/teacher'

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

  async login({ request, response }: HttpContext) {
    try {
      const { email, password, username } = request.only(['email', 'password', 'username'])

      const loginLimiter = limiter.use({
        requests: 5,
        duration: '1 min',
        blockDuration: '30 mins',
      })

      /**
       * Gunakan kombinasi alamat IP + email. Ini memastikan bahwa jika seorang penyerang menyalahgunakan email,
       * kita tidak memblokir pengguna asli dari login dan hanya memberikan penalti pada alamat IP penyerang.
       */
      const key = `login_${request.ip()}_${email}`

      if (!username) {
        const [error, user] = await loginLimiter.penalize(key, () => {
          return User.verifyCredentials(email, password)
        })

        if (error) {
          return response.tooManyRequests({
            error: {
              message: `Terlalu Banyak Permintaan Login, Ulangi Lagi dalam ${Math.ceil(error.response.availableIn / 60)} menit`,
              code: 'E_TOO_MANY_REQUESTS',
              status: 429,
              availableIn: error.response.availableIn,
            },
          })
        }

        const token = await User.accessTokens.create(user!)

        const role = await User.getRole(user!)
        const data = await this.getProfile(role, user!)

        return {
          message: 'Login Berhasil',
          role: role?.role,
          data,
          token: token,
        }
      }
      if (!email) {
        const [error, user] = await loginLimiter.penalize(key, () => {
          return User.verifyCredentials(username, password)
        })

        if (error) {
          return response.tooManyRequests({
            error: {
              message: `Terlalu Banyak Permintaan Login, Ulangi Lagi dalam ${error.response.availableIn / 60} menit`,
              code: 'E_TOO_MANY_REQUESTS',
              status: 429,
            },
          })
        }

        const token = await User.accessTokens.create(user!)

        const role = await User.getRole(user!)
        const data = await this.getProfile(role, user!)

        return {
          message: 'Login Berhasil',
          role: role?.role,
          data,
          token: token,
        }
      }
    } catch (error) {
      if (error instanceof authErrors.E_INVALID_CREDENTIALS) {
        throw error
      } else if (error instanceof lucidErrors.E_ROW_NOT_FOUND) {
        return response.notFound({
          error: {
            message:
              'Data yang anda cari tidak memiliki informasi yang dibutuhkan' +
              ' (contoh: tidak memiliki kelas, tidak aktif, dll)',
          },
        })
      }

      return response.status(500).send({
        error: {
          message: 'Terjadi kesalahan pada server',
          cause: error.message,
        },
      })
    }
  }

  async activeSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(now)

    return await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }

  protected async isGuardian(teacher: Teacher) {
    const isGuardian: boolean = (await teacher.related('class').query().first()) ? true : false

    return isGuardian
  }

  async getProfile(role: Role, user: User) {
    let profile: any
    let details
    let classStudent

    const activeSemester = await this.activeSemester()

    switch (role?.role) {
      case 'admin':
        profile = await user.related('admin').query().first()
        profile = {
          ...profile.serialize(),
        }
        break
      case 'teacher':
        profile = await user.related('teacher').query().first()
        if (profile) {
          profile = {
            isGuardian: await this.isGuardian(profile),
            ...profile.serialize(), // pastikan bentuknya plain object
          }
        }
        break
      case 'student':
        profile = await user.related('student').query().first()
        details = await profile?.related('studentDetail').query().first()
        classStudent = await profile
          ?.related('classStudent')
          .query()
          .where('academic_year_id', activeSemester.id)
          .preload('class', (c: any) => c.select('id', 'name'))
          .firstOrFail()
        profile = {
          ...profile.serialize(),
        }
        break
    }

    return {
      user,
      profile: {
        ...profile,
        details: { ...details?.serialize(), classStudent },
      },
      activeSemester,
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
