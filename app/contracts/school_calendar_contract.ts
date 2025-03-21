export default interface SchoolCalendarContract {
  /**
   * Mengambil semua Data, sepertinya tidak perlu filter,
   * karena hanya akan digunakan di kalender
   */
  getAll(): Promise<any>

  getOne(): Promise<Object>

  create(): Promise<Object>

  update(): Promise<Object>

  delete(): Promise<void>
}
