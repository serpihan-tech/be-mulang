import app from '@adonisjs/core/services/app'
import { errors as authErrors } from '@adonisjs/auth'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@adonisjs/core'
// import { errors as limiterErrors } from '@adonisjs/limiter' // TODO: add limiter errors

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    switch (true) {
      case error instanceof authErrors.E_INVALID_CREDENTIALS:
        return ctx.response.status(error.status).send({
          error: {
            message: 'Pastikan Email dan Password yang Anda Masukkan Benar!',
            cause: 'Invalid Credentials Input',
            code: error.code,
            status: error.status,
          },
        })

      case error instanceof authErrors.E_UNAUTHORIZED_ACCESS:
        return ctx.response.status(error.status).send({
          error: {
            message: 'Pastikan Anda Sudah Login!',
            cause: 'Unauthorized Access',
            code: error.code,
            status: error.status,
          },
        })

      case error instanceof errors.E_ROUTE_NOT_FOUND:
        return ctx.response.status(error.status).send({
          error: {
            ...error,
            message: 'Halaman Tidak  Ditemukan',
            cause: 'Kesalahan Penumaan Route / URL',
          },
        })

      // case error instanceof errors.E_TOO_MANY_REQUESTS:  // TODO : add limiter errors

      case error instanceof errors.E_CANNOT_LOOKUP_ROUTE:
        return ctx.response.status(error.status).send({
          error: {
            ...error,
            message: 'Akses Route Tidak Ditemukan',
            cause: 'Kesalahan Penamaan Route',
          },
        })

      case error instanceof errors.E_HTTP_EXCEPTION:
        return ctx.response.status(error.status).send({
          error: {
            ...error,
            message: error.message,
            cause: error.cause,
          },
        })
      default:
        return super.handle(error, ctx)
    }
  }

  /**
   * The method is used to report error to the logging service or
   * the third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    return super.report(error, ctx)
  }
}
