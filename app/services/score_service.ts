import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'
import Student from '#models/student'
import ClassStudent from '#models/class_student'
import Module from '#models/module'
import Schedule from '#models/schedule'
import AcademicYear from '#models/academic_year'

export default class ScoreService {
  async getAll(params: any): Promise<any> {
    const scores = await Score.filter(params).paginate(params.page || 1, params.limit || 10)

    return scores
  }

  async getOne(id: number): Promise<any> {
    const scores = await Score.query().where('id', id).firstOrFail()

    return scores
  }

  async getOwnScores(user: any): Promise<any> {
    const now = new Date()
    const student = await Student.query().where('user_id', user.id).firstOrFail()
    const activeSemester = await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
    const classStudent = await ClassStudent.query()
      .where('student_id', student.id)
      .where('academic_year_id', activeSemester.id)
      .firstOrFail()
    const schedule = await Schedule.query().where('class_id', classStudent.classId)
    const moduleList = await Module.query()
      .where(
        'id',
        'in',
        schedule.map((item) => item.moduleId)
      )
      .select('id', 'name')

    const scores = await Score.query().where('class_student_id', classStudent.id)

    const result = moduleList.map(
      (
        module
      ): {
        module: { id: number; name: string }
        scores: {
          taskList: number[]
          task: number | null
          uts: number | null
          uas: number | null
        }
      } => ({
        module: { id: module.id, name: module.name },
        scores: {
          taskList: [],
          task: null,
          uts: null,
          uas: null,
        },
      })
    )

    if (scores) {
      for (const score of scores) {
        const index = result.findIndex((item) => item.module.id === score.moduleId)
        if (index !== -1) {
          if (score.scoreTypeId === 1) {
            result[index].scores.taskList.push(score.score)
          } else if (score.scoreTypeId === 2) {
            result[index].scores.uts = score.score
          } else if (score.scoreTypeId === 3) {
            result[index].scores.uas = score.score
          }
        }
      }

      for (const element of result) {
        element.scores.task =
          element.scores.taskList.reduce((a, b) => a + b, 0) / element.scores.taskList.length
      }
    }

    return result
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    const scores = await Score.create(data, { client: trx })
    await trx.commit()

    return scores
  }

  async update(data: any, id: any): Promise<any> {
    const trx = await db.transaction()

    const score = await Score.query({ client: trx }).where('id', id).firstOrFail()
    score.merge(data)

    await score.useTransaction(trx).save()
    await trx.commit()

    return score
  }

  async massUpdate(data: any): Promise<any> {
    await Score.updateOrCreate(
      {
        classStudentId: data.class_student_id,
        moduleId: data.module_id,
        scoreTypeId: data.score_type_id,
        description: data.description,
      }, // Search criteria (harus unik)
      {
        score: data.score,
      } // Data yang akan diupdate
    )
  }

  async delete(id: number): Promise<any> {
    const score = await Score.query().where('id', id).firstOrFail()

    return await score.delete()
  }
}
