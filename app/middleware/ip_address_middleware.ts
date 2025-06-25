import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Env from '#start/env'

export default class IpAddressMiddleware {
  async handle(ctx: HttpContext, next: NextFn, action: string) {
    /**
     * Middleware logic goes here (before the next call)
     */
    const ip: string = ctx.request.ip()

    // console.log(ip)
    // ganti IP Sekolah
    if (ip !== Env.get('SCHOOL_IP_ADDRESS')?.toString()) {
      // * 103.23.103.97 IP Digital Center jaringan UNNES-ID
      return ctx.response.forbidden(`Harap ${action} menggunakan Jaringan Sekolah`)
    }

    /**
     * Call next method in the pipeline and return its output
     */
    const output = await next()
    return output
  }
}
