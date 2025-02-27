import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Student from '#models/student'
// import User from '#models/user'
// import Absence from '#models/absence'

export default class DashboardService {
  /**
   *@returns total siswa yang BELUM lulus
   */
  async getAllStudents({}: HttpContext) {
    const studentCount = await db
      .from('students')
      .where('is_graduate', false) // hanya siswa belum lulus
      .count('* as total')

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
  async getAllModules({}: HttpContext) {
    const moduleCount = await db
      .from('modules') //
      .count('* as total')

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
  async getAbsenceByWeek({}: HttpContext) {
    const startOfWeek = DateTime.local().startOf('week')
    const endOfWeek = DateTime.local().endOf('week')

    const absences = await db
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
      .groupBy('date')

    console.log('Data dari DB:', absences)

    const result = []

    for (let i = 0; i < 7; i++) {
      const currentDate = startOfWeek.plus({ days: i }).toISODate() // Format YYYY-MM-DD

      // Membandingkan hanya tanggal (tanpa waktu)
      const data = absences.find((a: { date: string }) => {
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
   * @param ctx
   * @returns total siswa, total guru, total mapel, total alumni, dan absensi
   */
  async dashboardAdmin(ctx: HttpContext) {
    const data = {
      total_students: await this.getAllStudents(ctx),
      total_teachers: await this.getAllTeachers(ctx),
      total_modules: await this.getAllModules(ctx),
      total_alumni: await this.getAlumni(ctx),
      absences: await this.getAbsenceByWeek(ctx),
    }

    return data
  }
}
