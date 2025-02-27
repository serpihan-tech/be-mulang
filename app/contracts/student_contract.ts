import type { HttpContext } from '@adonisjs/core/http'

export default interface StudentContract {
  /**
   * Get all student
   */
  index(): Promise<void>

  /**
   * Get a Schedule that belongs to a student
   */
  getPresenceSchedule(ctx: HttpContext): Promise<void>
}
