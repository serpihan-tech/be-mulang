import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

import AdminDashboardService from '#services/dashboard_admin_service'
import StudentDashboardService from '#services/dashboard_student_service'
import TeacherDashboardService from '#services/dashboard_teacher_service'
import User from '#models/user'

@inject()
export default class DashboardController {
  constructor(
    private adminDashboardService: AdminDashboardService,
    private studentDashboardService: StudentDashboardService,
    private teacherDashboardService: TeacherDashboardService
  ) {}

  async indexAdmin(ctx: HttpContext) {
    const data = await this.adminDashboardService.dashboardAdmin(ctx)
    return {
      message: 'Success Data Dashboard Admin + Chart',
      data: data,
    }
  }

  async indexStudent(ctx: HttpContext) {
    const data = await this.studentDashboardService.dashboardStudent(ctx)
    return {
      message: 'Success Data Dashboard Student',
      data: data,
    }
  }

  // TODO : Implementasi Dashboard Teacher
  async indexTeacher(ctx: HttpContext) {
    const data = await this.teacherDashboardService.dashboardTeacher(ctx)
    return {
      message: 'Success Data Dashboard Teacher',
      data: data,
    }
  }

  /**
   * * Landing method dari route ('/')
   * @return data dashbard sesuai role
   */
  async index({ auth, response }: HttpContext) {
    const user = auth.user!
    const role = await User.getRole(user)

    switch (role?.role) {
      case 'admin':
        return await this.indexAdmin({ auth, response } as HttpContext)
      case 'student':
        return await this.indexStudent({ auth, response } as HttpContext)
      case 'teacher':
        return await this.indexTeacher({ auth, response } as HttpContext)
      default:
        return response.unauthorized({ error: { message: 'Anda Harus Login Terlebih Dahulu' } })
    }
  }
}
