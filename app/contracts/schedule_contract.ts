export default interface ScheduleContract {
  /**
   * Get semua jadwal
   */
  getAll(page: number): Promise<any>

  /**
   * Mengambil jadwal berdasarkan id
   * @param id
   * @returns jadwal
   */
  getById(id: number): Promise<any>

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
}
