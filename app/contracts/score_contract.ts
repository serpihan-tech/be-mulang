export default interface ScoreContract {
  /**
   * Get semua data Nilai Siswa
   * - @coloumnFilter Nama kelas, Nama Mapel, NIS, Nama siswa, Nilai rerata Tipe Tugas Harian, Nilai UTS, Nilai UAS, Rata-rata
   * @typeFilter dropdown(Nama Kelas, Nama Mapel), sort asc | desc, search by input text (Nama Kelas, Nama Mapel, NIS, Nama siswa)
   * @info sort asc | desc berlaku untuk semua kolom
   */
  getAll(params: any): Promise<any>

  /**
   * Get detail nilai
   * - @param id
   */
  getOne(id: number): Promise<any>

  create(data: any): Promise<any>

  update(data: any, id: any): Promise<any>

  delete(id: number): Promise<any>
}
