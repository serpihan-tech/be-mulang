import type { HttpContext } from '@adonisjs/core/http'

export default interface AbsenceContract {
  /**
   * Mendapatkan semua absensi untuk admin
   * - @coloumnFilters tanggal absensi(date), NIS, Nama siswa, nama kelas, status kehadiran, keterangan (reason)
   * @typeFilter sort asc |desc, search by input text (Nama siswa, nama kelas, NIS), pilih date dengan kalender / tanggal pasti
   * @info sort asc | desc berlaku untuk semua kolom
   */
  getAll(params: any): Promise<any>

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
