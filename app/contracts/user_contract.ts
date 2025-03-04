import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default interface UserContract {
  /**
   * Mengambil semua data pengguna
   */
  index(page: number): Promise<any>

  /**
   * Mengambil data pengguna berdasarkan ID
   */
  show(id: number): Promise<any>

  /**
   * Membuat data pengguna baru
   */
  create(data: any): Promise<any>

  /**
   * Mengubah data pengguna berdasarkan ID
   */
  update(id: number, data: any): Promise<any>

  /**
   * Menghapus data pengguna berdasarkan ID
   */
  delete(user: User): Promise<any>
}
