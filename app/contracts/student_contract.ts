import type { HttpContext } from '@adonisjs/core/http'

export default interface StudentContract {
  /**
   * Mengambil data siswa dari pengguna yang sedang login.
   *
   * @param {HttpContext} ctx
   * @return {Promise<any | null>} Mengembalikan data siswa jika ditemukan, atau null jika tidak ada.
   */
  getStudent(ctx: HttpContext): Promise<any | null>

  /**
   * Mengambil informasi kelas siswa berdasarkan student_id.
   *
   * @param {number} studentId - ID siswa yang akan dicari.
   * @return {Promise<any | null>} Mengembalikan informasi kelas siswa jika ditemukan, atau null jika tidak ada.
   */
  getClassStudent(studentId: number): Promise<any | null>

  /**
   * Mengambil jadwal pelajaran berdasarkan class_id.
   *
   * @param {number} studentId - ID Student lalu ke class_student lalu ke classId yang akan dicari.
   * @return {Promise<any[]>} Mengembalikan daftar jadwal pelajaran dalam bentuk array.
   */
  getSchedule(studentId: any, { response }: HttpContext): Promise<any[]>

  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   *
   * @param {number} studentId - ID siswa yang akan dicari.
   * @return {Promise<{ total: number; hadir: number; tidak_hadir: number }>}
   * Mengembalikan jumlah total presensi, jumlah kehadiran, dan jumlah ketidakhadiran.
   */
  getPresence(studentId: any): Promise<Object>
}
