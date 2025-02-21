import { BaseSeeder } from '@adonisjs/lucid/seeders'
import RoleSeeder from '../role_seeder.js'
import UserSeeder from '../user_seeder.js'
import TeacherSeeder from '../teacher_seeder.js'
import UserHasRoleSeeder from '../user_has_role_seeder.js'

export default class IndexSeeder extends BaseSeeder {
  public async run() {
    await new RoleSeeder(this.client).run()
    await new UserSeeder(this.client).run()
    await new TeacherSeeder(this.client).run()
    await new UserHasRoleSeeder(this.client).run()
  }
}
