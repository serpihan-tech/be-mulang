import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'

export default class AdminDashboardService {
  private academic_yearId: number | undefined
  /**
   *@returns total siswa yang BELUM lulus
   */
  async getAllStudents(_sId?: number) {
    _sId = this.academic_yearId

    const query = db
      .from('students')
      .join('class_students', 'students.id', 'class_students.student_id')
      .where('students.is_graduate', false)

    if (_sId) {
      query.andWhere('class_students.academic_year_id', _sId)
    }

    const studentCount = await query.count('* as total')

    return studentCount[0].total
  }

  /**
   * @return total guru
   */
  async getAllTeachers() {
    const teacherCount = await db
      .from('teachers') //
      .count('* as total')

    return teacherCount[0].total
  }

  /**
   * @return total mata pelajaran
   */
  async getAllModules(_sId?: number) {
    _sId = this.academic_yearId

    const module = db.from('modules') //

    if (_sId) {
      module.where('modules.academic_year_id', _sId)
    }

    const moduleCount = await module.count('* as total')

    return moduleCount[0].total
  }

  /**
   * @return total alumni / yang SUDAH lulus
   */
  async getAlumni() {
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
  async getAbsenceByWeek(_sId?: number) {
    _sId = this.academic_yearId

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

    if (!_sId) {
      absences.whereBetween('date', [startOfWeek.toISODate(), endOfWeek.toISODate()])
    }

    if (_sId) {
      absences.andWhere('class_students.academic_year_id', _sId)
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
   * @returns semua academic_year
   */
  async getAllAcademicYears() {
    const academicYears = await db.from('academic_years').select('id', 'name')

    return academicYears
  }

  /**
   *
   * @param ctx
   * @returns total siswa, total guru, total mapel, total alumni, dan absensi
   */
  async dashboardAdmin(_sId?: number) {
    this.academic_yearId = _sId
    const data = {
      total_students: await this.getAllStudents(this.academic_yearId),
      total_teachers: await this.getAllTeachers(),
      total_modules: await this.getAllModules(this.academic_yearId),
      total_alumni: await this.getAlumni(),
      absences: await this.getAbsenceByWeek(this.academic_yearId),
      academic_years: await this.getAllAcademicYears(),
    }

    return data
  }

  async chartAbsencesForAdmins(params?: any) {
    const now = DateTime.local()
    // Minggu aktif berakhir di hari Jumat (2) atau Sabtu (1)
    const lastDayOfWeek = 2 // Jumat

    const activeSemester = await this.getActiveSemester()

    const timePeriod: string = params.periode
    const academicYearId: number = params.tahunAjar ?? activeSemester?.id

    let result = {}

    if (timePeriod === 'minggu') {
      // Mingguan (Senin - Minggu)
      const startOfWeek = now.startOf('week')
      const endOfWeek = now.endOf('week').minus({ days: lastDayOfWeek })

      result = await this.getAbsencesData(startOfWeek, endOfWeek)
    } else if (timePeriod === 'bulan') {
      // Bulanan (Tanggal 1 - akhir bulan)
      const startOfMonth = now.startOf('month')
      const endOfMonth = now.endOf('month')

      // console.log('startOfMonth', startOfMonth)
      result = await this.getAbsencesData(startOfMonth, endOfMonth)
    } else if (timePeriod === 'semester') {
      // Semester (dari academic year aktif)
      const semester = await AcademicYear.query().where('id', academicYearId).firstOrFail()

      const startOfSemester = DateTime.fromJSDate(semester.dateStart)
      const endOfSemester = DateTime.fromJSDate(semester.dateEnd)

      console.log('startOfSemester', startOfSemester)

      result = await this.getAbsencesData(startOfSemester, endOfSemester)
    }

    // console.log('params', params)
    // console.log('now', now)
    // --- log : ---
    // now DateTime { ts: 2025-05-16T22:34:39.390+07:00, zone: Asia/Bangkok, locale: en-US }

    return result
  }

  // for chartAbsencesForAdmins
  private async getAbsencesData(startDate: DateTime, endDate: DateTime): Promise<Object> {
    // Format ISO
    const start = startDate.toISODate()!
    const end = endDate.toISODate()!

    // console.log('start', start)
    // console.log('end', end)
    // --- log : ---
    // start 2025-05-01
    // end 2025-05-31

    const siswaAbsences = await db
      .from('absences')
      .select('date', 'status')
      .whereBetween('date', [start, end])

    const guruAbsences = await db
      .from('teacher_absences')
      .select('date', 'status')
      .whereBetween('date', [start, end])

    const siswaHadirMap = new Map<string, number>()
    const siswaTidakHadirMap = new Map<string, number>()
    const guruHadirMap = new Map<string, number>()
    const guruTidakHadirMap = new Map<string, number>()

    for (const absen of siswaAbsences) {
      const date = DateTime.fromJSDate(absen.date).toISODate()! // Konversi ke ISO string (YYYY-MM-DD)
      if (absen.status === 'Hadir') {
        siswaHadirMap.set(date, (siswaHadirMap.get(date) || 0) + 1)
      } else {
        siswaTidakHadirMap.set(date, (siswaTidakHadirMap.get(date) || 0) + 1)
      }
    }

    for (const absen of guruAbsences) {
      const date = DateTime.fromJSDate(absen.date).toISODate()!
      if (absen.status === 'Hadir') {
        guruHadirMap.set(date, (guruHadirMap.get(date) || 0) + 1)
      } else {
        guruTidakHadirMap.set(date, (guruTidakHadirMap.get(date) || 0) + 1)
      }
    }

    // Generate semua tanggal
    const range: string[] = []
    let cursor = startDate
    while (cursor <= endDate) {
      const isoDate = cursor.toISODate()
      if (isoDate) range.push(isoDate)
      cursor = cursor.plus({ days: 1 })
    }

    const siswaHadir = range.map((date) => ({ date, value: siswaHadirMap.get(date) || 0 }))
    const siswaTidakHadir = range.map((date) => ({
      date,
      value: siswaTidakHadirMap.get(date) || 0,
    }))
    const guruHadir = range.map((date) => ({ date, value: guruHadirMap.get(date) || 0 }))
    const guruTidakHadir = range.map((date) => ({ date, value: guruTidakHadirMap.get(date) || 0 }))

    return {
      siswa: {
        hadir: siswaHadir,
        tidakHadir: siswaTidakHadir,
      },
      guru: {
        hadir: guruHadir,
        tidakHadir: guruTidakHadir,
      },
    }
  }

  private async getActiveSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')

    return await AcademicYear.query()
      .where('status', 1 || true)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .first()
  }
}
