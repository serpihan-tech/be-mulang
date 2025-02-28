import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export default class AdminDashboardService {
  private semesterId: number | undefined
  /**
   *@returns total siswa yang BELUM lulus
   */
  async getAllStudents({}: HttpContext, _sId?: number) {
    _sId = this.semesterId

    const query = db
      .from('students')
      .join('class_students', 'students.id', 'class_students.student_id')
      .where('students.is_graduate', false)

    if (_sId) {
      query.andWhere('class_students.semester_id', _sId)
    }

    const studentCount = await query.count('* as total')

    return studentCount[0].total
  }

  /**
   * @return total guru
   */
  async getAllTeachers({}: HttpContext) {
    const teacherCount = await db
      .from('teachers') //
      .count('* as total')

    return teacherCount[0].total
  }

  /**
   * @return total mata pelajaran
   */
  async getAllModules({}: HttpContext, _sId?: number) {
    _sId = this.semesterId

    const module = db.from('modules') //

    if (_sId) {
      module.where('modules.semester_id', _sId)
    }

    const moduleCount = await module.count('* as total')

    return moduleCount[0].total
  }

  /**
   * @return total alumni / yang SUDAH lulus
   */
  async getAlumni({}: HttpContext) {
    const alumniCount = await db
      .from('students')
      .where('is_graduate', true) // hanya siswa lulus
      .count('* as total')

    return alumniCount[0].total
  }

  /**
   *
   * @returns berupa absensi per hari selama seminggu Senin - Minggu
   *          data absensi akan dikembalikan dalam bentuk array
   *          response body akan berwujud seperti berikut:
   *          [
   *               day: Senin,
   *               date: '2025-02-28',
   *               hadir: 320,
   *               izin: 2,
   *               sakit: 3,
   *               alfa: 5
   *           ]
   */
  async getAbsenceByWeek({}: HttpContext, _sId?: number) {
    _sId = this.semesterId

    const startOfWeek = DateTime.local().startOf('week')
    const endOfWeek = DateTime.local().endOf('week')

    const absences = db
      .from('absences')
      .join('class_students', 'absences.class_student_id', 'class_students.id')
      .join('students', 'class_students.student_id', 'students.id')
      .where('students.is_graduate', false) // make sure alumni tidak terhitung di absensi minggu tsb
      .select('absences.date')
      .select(db.raw("SUM(CASE WHEN status = 'Hadir' THEN 1 ELSE 0 END) as hadir"))
      .select(db.raw("SUM(CASE WHEN status = 'Izin' THEN 1 ELSE 0 END) as izin"))
      .select(db.raw("SUM(CASE WHEN status = 'Sakit' THEN 1 ELSE 0 END) as sakit"))
      .select(db.raw("SUM(CASE WHEN status = 'Alfa' THEN 1 ELSE 0 END) as alfa"))
      .whereBetween('date', [startOfWeek.toISODate(), endOfWeek.toISODate()])

    if (_sId) {
      absences.andWhere('class_students.semester_id', _sId)
    }

    const absencesResult = await absences.groupBy('date')

    // console.log('Data dari DB:', absencesResult)

    const result = []

    for (let i = 0; i < 7; i++) {
      const currentDate = startOfWeek.plus({ days: i }).toISODate() // Format YYYY-MM-DD

      // Membandingkan hanya tanggal (tanpa waktu)
      const data = absencesResult.find((a: { date: string }) => {
        const dbDate = DateTime.fromJSDate(new Date(a.date)).toISODate()
        return dbDate === currentDate
      })

      result.push({
        day: DateTime.fromISO(currentDate).setLocale('id').toFormat('EEEE'), // Nama hari dalam bahasa Indonesia
        date: currentDate,
        hadir: data ? Number(data.hadir) : 0,
        izin: data ? Number(data.izin) : 0,
        sakit: data ? Number(data.sakit) : 0,
        alfa: data ? Number(data.alfa) : 0,
      })
    }

    // console.log('Hasil Absensi:', result)
    return result
  }

  /**
   *
   * @returns semua semester
   */
  async getAllSemesters({}: HttpContext) {
    const semesters = await db.from('semesters').select('id', 'name')

    return semesters
  }

  /**
   *
   * @param ctx
   * @returns total siswa, total guru, total mapel, total alumni, dan absensi
   */
  async dashboardAdmin(ctx: HttpContext, _sId?: number) {
    this.semesterId = _sId
    const data = {
      total_students: await this.getAllStudents(ctx, this.semesterId),
      total_teachers: await this.getAllTeachers(ctx),
      total_modules: await this.getAllModules(ctx, this.semesterId),
      total_alumni: await this.getAlumni(ctx),
      absences: await this.getAbsenceByWeek(ctx, this.semesterId),
      semesters: await this.getAllSemesters(ctx),
    }

    return data
  }
}
