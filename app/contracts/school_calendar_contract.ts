export default interface SchoolCalendarContract {
  /**
   * Mengambil semua Data, sepertinya tidak perlu filter,
   * karena hanya akan digunakan di kalender
   */
  getAll(): Promise<any>

  getOne(id: number): Promise<Object>

  create(data: any): Promise<Object>

  update(id: number, data: any): Promise<Object>

  delete(id: number): Promise<void>
}
