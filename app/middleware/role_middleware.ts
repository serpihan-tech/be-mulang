import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class RoleMiddleware {
  /**
   * Middleware untuk cek apakah role user sesuai dengan role yang diinginkan
   * @param {string[]} allowedRoles Array roles yang diizinkan
   *
   * contoh penggunaan : .use(middleware.role(['admin'])) -
   * jika lebih dari satu maka : .use(middleware.role(['admin', 'teacher']))
   *
   */
  public async handle(
    { auth, response }: HttpContext,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    const user = auth.user as User | null
    // console.log(user)

    if (!user) {
      return response.unauthorized({ error: { message: 'Anda Harus Login Terlebih Dahulu' } })
    }

    // Load roles dari pivot table `user_has_roles`
    await user.load('roles')

    // Cek jika user memiliki salah satu role yang diizinkan
    const hasRole = user.roles.some((role) => allowedRoles.includes(role.role))

    if (!hasRole) {
      return response.forbidden({ error: { message: 'Anda Tidak Memiliki Akses Untuk Hal Ini' } })
    }

    // Jika user memiliki role yang diizinkan, lanjutkan ke middleware berikutnya
    await next()
  }
}
