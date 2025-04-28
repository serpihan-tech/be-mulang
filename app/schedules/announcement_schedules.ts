import AnnouncementByAdmin from '#models/announcement_by_admin'
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { DateTime } from 'luxon'
import transmit from '@adonisjs/transmit/services/main'
import Admin from '#models/admin'
import User from '#models/user'
import Teacher from '#models/teacher'

export default class AnnouncementSchedules {
  private static now =
    DateTime.now().setZone('Asia/Jakarta').toSQL() ??
    new Date().toISOString().slice(0, 19).replace('T', ' ')

  static async postAnnouncementByAdmin() {
    const announcements = await AnnouncementByAdmin.query().where('date', '=', this.now)

    const role = 'admin'
    let adminId: number = 0

    const admin = await Admin.query().where('id', adminId).firstOrFail()

    for (const an of announcements) {
      an.adminId = adminId

      const t = transmit.broadcast(`notifications/${an.targetRoles}`, {
        message: {
          id: an.id,
          title: an.title,
          content: an.content,
          category: an.category,
          from: admin.name,
          role: role,
          files: an.files,
          date: an.date.toISOString(),
          senderPicture: admin.profilePicture,
          senderEmail: admin.user.email,
        },
      })
    }
  }

  static async postAnnouncementByTeacher() {
    const announcements = await AnnouncementByTeacher.query().where('date', '=', this.now)
    const role = 'teacher'

    for (const an of announcements) {
      const teacher = await Teacher.query().where('id', an.teacherId).firstOrFail()

      const t = transmit.broadcast(`notifications/teachers/class/${an.classId}`, {
        message: {
          id: an.id,
          title: an.title,
          content: an.content,
          category: an.category,
          from: teacher.name,
          role: role,
          files: an.files,
          date: an.date.toISOString(),
          senderPicture: teacher.profilePicture,
          senderEmail: teacher.user.email,
        },
      })
    }
  }
}
