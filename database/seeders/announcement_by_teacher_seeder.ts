import { AnnouncementByTeacherFactory } from '#database/factories/announcement_by_teacher_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await AnnouncementByTeacherFactory.createMany(26)
  }
}
