import { BaseSeeder } from '@adonisjs/lucid/seeders'
import RoleSeeder from '../role_seeder.js'
import Permission from '../permission_seeder.js'
import UserSeeder from '../user_seeder.js'
import TeacherSeeder from '../teacher_seeder.js'
import UserHasRoleSeeder from '../user_has_role_seeder.js'
import AdminSeeder from '../admin_seeder.js'
import ClassSeeder from '../class_seeder.js'
import StudentSeeder from '../student_seeder.js'
import StudentDetailSeeder from '../student_detail_seeder.js'
import ClassStudentSeeder from '../class_student_seeder.js'
import ModuleSeeder from '../module_seeder.js'
import RoomSeeder from '../room_seeder.js'
import ScoreSeeder from '../score_seeder.js'
import ScoreTypeSeeder from '../score_type_seeder.js'
import AcademicYearSeeder from '../academic_year_seeder.js'
import AbsenceSeeder from '../absence_seeder.js'
import ScheduleSeeder from '../schedule_seeder.js'
import AnnouncementByAdmin from '../announcement_by_admin_seeder.js'
import AnnouncementByTeacher from '../announcement_by_teacher_seeder.js'
import SchoolCalendarSeeder from '../school_calendar_seeder.js'

export default class IndexSeeder extends BaseSeeder {
  public async run() {
    await new RoleSeeder(this.client).run()
    await new Permission(this.client).run()
    await new UserSeeder(this.client).run()
    await new UserHasRoleSeeder(this.client).run()
    await new TeacherSeeder(this.client).run()
    await new AdminSeeder(this.client).run()
    await new StudentSeeder(this.client).run()
    await new StudentDetailSeeder(this.client).run()
    await new ClassSeeder(this.client).run()
    await new AcademicYearSeeder(this.client).run()
    await new ModuleSeeder(this.client).run()
    await new ClassStudentSeeder(this.client).run()
    await new RoomSeeder(this.client).run()
    await new ScoreTypeSeeder(this.client).run()
    await new ScoreSeeder(this.client).run()
    await new ScheduleSeeder(this.client).run()
    await new AbsenceSeeder(this.client).run()
    await new AnnouncementByAdmin(this.client).run()
    await new AnnouncementByTeacher(this.client).run()
    await new SchoolCalendarSeeder(this.client).run()
  }
}
