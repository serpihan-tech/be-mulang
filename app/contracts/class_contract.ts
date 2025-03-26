export default interface ClassContract {
  /**
   * get data semua kelas dengan beberapa filter
   * @coloumnFilters id kelas, nama kelas, nama wali kelas, jumlah siswa, search (Nama kelas, nama wali, id kelas)
   * @typeFilter sort asc | desc, search by input text
   */
  getAll(params: any): Promise<any>
}
