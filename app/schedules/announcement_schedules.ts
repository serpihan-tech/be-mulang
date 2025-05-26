import AnnouncementByAdmin from '#models/announcement_by_admin'
import AnnouncementByTeacher from '#models/announcement_by_teacher'
import { DateTime } from 'luxon'
import transmit from '@adonisjs/transmit/services/main'
import Admin from '#models/admin'
import Teacher from '#models/teacher'

export default class AnnouncementSchedules {
  private static now = DateTime.local().toISODate()

  static async postAnnouncementByAdmin() {
    const announcements = await AnnouncementByAdmin.query().where('date', '=', this.now)

    const role = 'admin'

    for (const an of announcements) {
      const admin = await Admin.query().where('id', an.adminId).preload('user').first()

      if (!admin) continue

      transmit.broadcast(`notifications/${an.targetRoles}`, {
        message: {
          id: `44${an.id}`,
          title: an.title,
          content: an.content,
          category: an.category,
          from: admin.name ?? 'undefined',
          role: role,
          files: an.files,
          date: an.date.toISOString(),
          senderPicture: admin.profilePicture ?? 'undefined',
          senderEmail: admin.user.email ?? 'undefined',
          createdAt: an.createdAt.toString(),
          updatedAt: an.updatedAt.toString(),
        },
      })
    }
  }

  static async postAnnouncementByTeacher() {
    const announcements = await AnnouncementByTeacher.query().where('date', '=', this.now)
    const role = 'teacher'

    for (const an of announcements) {
      const teacher = await Teacher.query()
        .where('id', an.teacherId)
        .preload('user', (u) => u.select('id', 'name'))
        .first()

      if (!teacher) continue

      // console.log('announcements teacher : ', an)
      transmit.broadcast(`notifications/teachers/class/${an.classId}`, {
        message: {
          id: `74${an.id}`,
          title: an.title,
          content: an.content,
          category: an.category,
          from: teacher.name ?? 'undefined',
          role: role,
          files: an.files,
          date: an.date.toISOString(),
          senderPicture: teacher.profilePicture ?? 'undefined',
          senderEmail: teacher.user.email ?? 'undefined',
          createdAt: an.createdAt.toString(),
          updatedAt: an.updatedAt.toString(),
        },
      })
    }
  }
}
