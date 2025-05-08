export interface AnnouncementByAdminContract {
  /**
   * Mengambil semua pengumuman Admin
   * - @coloumnFilters Judul, Deskripsi, Kategori, Tanggal
   * @typeFilter sort asc | desc, dropdown (kategori), pilih tanggal dengan kalender, search by input text (Judul)
   * @info sort asc | desc berlaku untuk semua kolom
   */
  getAll(params: any): Promise<any>

  /**
   * @param id
   * @return pengumuman berdasarkan id
   */
  getOne(id: number): Promise<any>

  /**
   * @param data
   * @return pengumuman baru
   */
  create(data: any, adminId: number): Promise<Object>

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

export interface AnnouncementByTeacherContract {
  /**
   * Mengambil semua Pengumuman Guru
   * - @coloumnFilters Judul, Deskripsi, Nama Kelas,Tanggal, Nama pengirim
   *  @typeFilter sort asc | desc, dropdown (Kelas), pilih tanggal dengan kalender, search by input text (Judul, Nama pengirim/guru)
   */
  getAll(params: any): Promise<any>

  /**
   * @param id
   * @return pengumuman berdasarkan id
   */
  getOne(id: number): Promise<any>

  /**
   * @param data
   * @return pengumuman baru
   */
  create(data: any, adminId: number): Promise<Object>

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

// ! Sementara disable / tidak dipakai
export interface AnnouncementContract {
  /**
   * Mengambil semua pengumuman yang dibuat oleh dua role (admin dan guru)
   * - @coloumnFilters Judul, Deskripsi, Kategori, Tanggal, Dibuat oleh, Status
   */
  getBothAll(params: any): Promise<any>
}
