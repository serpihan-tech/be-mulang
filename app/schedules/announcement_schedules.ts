import AnnouncementByAdmin from '#models/announcement_by_admin'
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { DateTime } from 'luxon'
import transmit from '@adonisjs/transmit/services/main'
import Admin from '#models/admin'
import User from '#models/user'

export default class AnnouncementSchedules {
  protected now =
    DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  async postAnnouncementByAdmin() {
    const announcements = await AnnouncementByAdmin.query().where('date', '=', this.now)

    let adminId: number = 0
    const admin = await Admin.query().where('id', adminId).firstOrFail()
    const role = await User.getRole(await admin.related('user').query().firstOrFail())

    for (const an of announcements) {
      an.adminId = adminId

      const t = transmit.broadcast(`notifications/${an.targetRoles}`, {
        message: {
          id: an.id,
          title: an.title,
          from: admin.name,
          role: role.role,
          // file: an.files,
          content: an.content,
          category: an.category,
          date: an.date.toISOString(),
        },
      })
    }
  }
}
