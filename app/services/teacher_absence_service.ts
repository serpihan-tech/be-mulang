import TeacherAbsenceContract from '../contracts/teacher_absence_contract.js'

export class TeacherAbsenceService implements TeacherAbsenceContract {
  getAll(params: any): Promise<any> {
    throw new Error('Method not implemented.')
  }
  getOne(teacherAbsenceId: number): Promise<Object> {
    throw new Error('Method not implemented.')
  }
  create(data: any): Promise<Object> {
    throw new Error('Method not implemented.')
  }
  update(teacherAbsenceId: number, data: any): Promise<Object> {
    throw new Error('Method not implemented.')
  }
  delete(teacherAbsenceId: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
