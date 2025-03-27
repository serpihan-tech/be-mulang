export default interface ScheduleContract {
  /**
   * Mengambil semua Jadwal
   * - @coloumnFilters Id jadwal, Nama Hari, Nama kelas, Nama mapel, Nama guru, Nama ruangan, Jam mulai, Jam selesai
   * @typeFilter sort asc | desc, dropdown (semua kecuali id jadwal, jam mulai, jam selesai), search by input text(Nama kelas, mapel, guru, ruangan)
   * @info sort asc | desc berlaku untuk semua kolom
   *
   */
  getAll(params: any): Promise<any>

  /**
   * Mengambil jadwal berdasarkan id
   * @param id
   * @returns jadwal
   */
  getOne(id: number): Promise<any>

  /**
   * Membuat jadwal baru
   * @returns Object
   */
  create(data: any): Promise<Object>

  /**
   * Mengupdate atau mengedit jadwal
   * @param id
   * @returns Object
   */
  update(id: number, data: any): Promise<Object>

  /**
   * Menghapus jadwal
   * @param id
   * @returns void
   */
  delete(id: number): Promise<void>

  /**
   * Mengambil semua jadwal guru
   * @param teacherId
   * @returns jadwal
   */
  TeachersSchedule(teacherId: number): Promise<any[]>
}
