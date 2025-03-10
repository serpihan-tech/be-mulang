import { AnnouncementByAdminFactory } from '#database/factories/announcement_by_admin_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    AnnouncementByAdminFactory.createMany(8)
  }
}
