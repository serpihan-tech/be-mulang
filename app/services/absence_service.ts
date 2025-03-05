import Absence from '#models/absence'
import AcademicYear from '#models/academic_year'
import AbsenceContract from '../contracts/absence_contract.js'

export class AbsenceService implements AbsenceContract {
  /**
   * Mendapatkan semua absensi dari tahun ajar yang aktif
   * @param page buat pagination
   * @param date buat filter
   */
  async getAll(date: Date, page: number): Promise<any> {
    const limit = 10

    const firstSemester = await AcademicYear.query()
      .where('status', true)
      .orderBy('date_start', 'asc')
      .firstOrFail()

    // Ambil semester kedua (status true yang paling akhir)
    const secondSemester = await AcademicYear.query()
      .where('status', true)
      .orderBy('date_start', 'desc')
      .firstOrFail()

    if (!date) {
      date = new Date()
      date.setHours(date.getHours() + 7)
    }

    console.log(date)

    const absences = await Absence.query()
      .where('date', date)
      .select(['id', 'class_student_id', 'schedule_id', 'status', 'reason', 'date'])
      .preload('schedule', (s) => {
        s.select(['id', 'class_id', 'days', 'start_time', 'end_time'])
      })
      .preload('classStudent', (cs) => {
        cs.select(['id', 'class_id', 'student_id', 'academic_year_id'])
        cs.preload('academicYear', (ay) => {
          ay.select(['id', 'semester'])
        })
        cs.preload('class', (c) => {
          c.select(['name'])
        })
        cs.preload('student', (s) => {
          s.select(['id', 'name'])
          s.preload('studentDetail', (sd) => {
            sd.select(['nisn', 'nis'])
          })
        })
      })
      .paginate(page, limit)

    return {
      firstSemester,
      secondSemester,
      absences,
    }
  }
  async update(absenceId: number, data: any): Promise<any> {
    const absence = await Absence.query().where('id', absenceId).firstOrFail()
    return await absence.merge(data).save()
  }
  async delete(absenceId: number): Promise<any> {
    const absence = await Absence.query().where('id', absenceId).firstOrFail()
    return await absence.delete()
  }
}
