import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class RoleMiddleware {
  /**
   * Middleware to check if the user has any of the allowed roles
   */
  public async handle(
    { auth, response }: HttpContext,
    next: () => Promise<void>,
    allowedRoles: string[]
  ) {
    const user = auth.user as User | null
    console.log(user)
    if (!user) {
      return response.unauthorized({ message: 'Anda Harus Login Terlebih Dahulu' })
    }

    // Load roles from pivot table `user_has_roles`
    await user.load('roles')

    // Check if the user has any of the allowed roles
    const hasRole = user.roles.some((role) => allowedRoles.includes(role.role))

    if (!hasRole) {
      return response.forbidden({ message: 'Anda Tidak Memiliki Akses Untuk Hal Ini' })
    }

    // continue to the next middleware or request handler
    await next()
  }
}
