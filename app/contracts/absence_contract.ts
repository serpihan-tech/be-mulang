import type { HttpContext } from '@adonisjs/core/http'

export default interface AbsenceContract {
  /**
   * Mendapatkan semua absensi
   */
  getAll(date: Date, page: number): Promise<any>

  /**
   * Edit dan update absensi
   * @param absenceId
   */
  update(absenceId: number, data: any): Promise<any>

  /**
   * Hapus absensi
   * @param absenceId
   */
  delete(absenceId: number): Promise<any>

  /**
   * @param absenceId - Id Absensi
   * Mendapatkan absensi berdasarkan id
   */
  getById(absenceId: number): Promise<any>

  /**
   * @param StudentId - Id student
   * Mendapatkan absensi berdasarkan student_id
   */
  getByStudentId(studentId: number): Promise<any>
}
