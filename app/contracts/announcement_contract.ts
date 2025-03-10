export interface AnnouncementByAdminContract {
  /**
   * @return semua pengumuman
   */
  getAll(page: number): Promise<any>

  /**
   * @param id
   * @return pengumuman berdasarkan id
   */
  getOne(id: number): Promise<any>

  /**
   * @param data
   * @return pengumuman baru
   */
  create(data: any): Promise<Object>

  /**
   * @param id
   * @param data
   * @return pengumuman yang diubah
   */
  update(id: number, data: any): Promise<Object>

  /**
   * @param id
   * @return void
   */
  delete(id: number): Promise<void>
}

export interface AnnouncementByTeacherContract {}
