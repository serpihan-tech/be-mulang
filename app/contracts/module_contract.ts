export default interface ModuleContract {
  /**
   * Mengambiil semua Mata Pelajaran
   * - @coloumnFilters Nama mapel, nama guru, tahun ajar (semester tahun ajar e.g. Genap 2024/2025), status, Id mapel,
   * @typeFilters sort asc | desc, dropdown (semua kecuali ID mapel), search by input text (Nama mapel, Nama guru)
   * @info sort asc | desc berlaku untuk semua kolom
   */
  getAll(params: any): Promise<any>

  /**
   * - Get detail mapel
   * @param id
   */
  getOne(id: number): Promise<any>

  create(data: any): Promise<any>

  update(id: any, data: any): Promise<any>

  delete(id: number): Promise<any>
}
