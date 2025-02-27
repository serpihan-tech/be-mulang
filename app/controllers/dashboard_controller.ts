import type { HttpContext } from '@adonisjs/core/http'
import DashboardService from '#services/dashboard_service'
import { inject } from '@adonisjs/core'

export default class DashboardController {
  @inject()
  async indexAdmin(ctx: HttpContext, dashboardService: DashboardService) {
    const data = await dashboardService.dashboardAdmin(ctx)

    return {
      message: 'Success Data Dashboard + Chart',
      data: data,
    }
  }
}
