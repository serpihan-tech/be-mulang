import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class RouteNotFoundException extends Exception {
  static status = 404
  static code = 'E_ROUTE_NOT_FOUND'
  static message = 'Route not found'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).send({ message: 'test' })
  }
}
