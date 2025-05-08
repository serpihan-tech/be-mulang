export default interface AcademicYearContract {
  /**
   * Mengambil academic_year yang dilalui oleh student yang login
   */
  getMyAcademicYear(studentId: number): Promise<any>

  /**
   *  Mengambil semua data academic year untuk admin
   *  - @coloumnFilters Id tahun ajar, nama tahun ajar, tanggal mulai, tanggal selesai, status, search (Nama & ID)
   *  @typeFilters sort asc | desc , search by input text
   */
  getAll(params: any): Promise<any>
}
