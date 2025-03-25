import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'
import Student from '#models/student'
import ClassStudent from '#models/class_student'
import Module from '#models/module'
import AcademicYear from '#models/academic_year'
import Schedule from '#models/schedule'
import ScoreType from '#models/score_type'

type ResultProps = {
  id: number
  name: string
  scores: {
    taskList: any[]
    task: any
    uts: any
    uas: any
    totalList: any[]
    total: any
  }
}
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
    const student = await Student.query().where('user_id', user.id).firstOrFail()
    const classStudentList = await ClassStudent.query().where('student_id', student.id)
    const academicYearIds = classStudentList.map((cs) => cs.academicYearId)

    const academicYear = await AcademicYear.query().whereIn('id', academicYearIds)
    const schedule = await Schedule.query().whereIn(
      'class_id',
      classStudentList.map((cs) => cs.classId)
    )
    const roundToInteger = (num: number | null): number | null => {
      if (num === null) return null
      return Math.round(num)
    }
    const moduleList = await Module.query()
      .whereIn(
        'id',
        schedule.map((item) => item.moduleId)
      )
      .select('id', 'name', 'academic_year_id')

    const scores = await Score.query().whereIn(
      'class_student_id',
      classStudentList.map((cs) => cs.id)
    )
    const scoreType = await ScoreType.query()

    // Mengelompokkan berdasarkan tahun akademik yang pernah dilalui oleh siswa
    const result = academicYear.map(
      (
        ac
      ): {
        academicYear: {
          id: number
          name: string
          semester: string
          status: boolean
        }
        modules: ResultProps[]
      } => ({
        academicYear: { id: ac.id, name: ac.name, semester: ac.semester, status: ac.status },
        modules: [],
      })
    )

    for (const element of result) {
      const moduleMap = new Map<number, ResultProps>()

      for (const module of moduleList) {
        if (module.academicYearId !== element.academicYear.id) continue

        if (!moduleMap.has(module.id)) {
          moduleMap.set(module.id, {
            id: module.id,
            name: module.name,
            scores: {
              taskList: [],
              task: null,
              uts: null,
              uas: null,
              totalList: [],
              total: null,
            },
          })
        }

        const data = moduleMap.get(module.id)!

        for (const score of scores) {
          if (score.moduleId === module.id) {
            let type = null
            if (score.scoreTypeId === 1) {
              data.scores.taskList.push(score.score)
              type = 1
            } else if (score.scoreTypeId === 2) {
              data.scores.uts = roundToInteger(score.score)
              type = 2
            } else if (score.scoreTypeId === 3) {
              data.scores.uas = roundToInteger(score.score)
              type = 3
            }

            if (type) {
              data.scores.totalList.push({ type, score: score.score })
            }
          }
        }

        if (data.scores.taskList.length > 0) {
          const taskAvg =
            data.scores.taskList.reduce((sum, val) => sum + val, 0) / data.scores.taskList.length
          data.scores.task = roundToInteger(taskAvg)
        }

        if (data.scores.totalList.length > 0) {
          const totalScore = data.scores.totalList.reduce((sum, val) => {
            const weight = scoreType.find((st) => st.id === val.type)?.weight || 0
            return sum + (val.score * weight) / 100
          }, 0)
          data.scores.total = roundToInteger(totalScore)
        }
      }

      element.modules = Array.from(moduleMap.values())
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
