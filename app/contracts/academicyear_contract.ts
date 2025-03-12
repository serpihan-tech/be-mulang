export default interface AcademicYearContract {
  /**
   * Mengambil academic_year yang dilalui oleh student yang login
   */
  getMyAcademicYear(studentId: number): Promise<any>
}
