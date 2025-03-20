export default interface TeacherAbsenceContract {
  getAll(params: any): Promise<any>

  getOne(teacherAbsenceId: number): Promise<Object>

  create(data: any): Promise<Object>

  update(teacherAbsenceId: number, data: any): Promise<Object>

  delete(teacherAbsenceId: number): Promise<void>
}
