import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'
import Student from '#models/student'
import ClassStudent from '#models/class_student'
import Module from '#models/module'
import AcademicYear from '#models/academic_year'
import Schedule from '#models/schedule'
import ScoreType from '#models/score_type'
import { messages } from '../utils/validation_message.js'

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
  async getAll(params: any | undefined): Promise<any> {
    let scoresQuery = Score.query()
      .preload('classStudent', (query) =>
        query
          .preload('class', (classQuery) =>
            classQuery.preload('teacher', (teacherQuery) => teacherQuery.select('id', 'name'))
          )
          .preload('academicYear', (academicYearQuery) =>
            academicYearQuery.select('id', 'name', 'dateStart', 'dateEnd', 'semester', 'status')
          )
      )
      .preload('module')
      .preload('scoreType')
      .innerJoin('class_students', 'scores.class_student_id', 'class_students.id')
      .innerJoin('classes', 'class_students.class_id', 'classes.id')
      .innerJoin('modules', 'scores.module_id', 'modules.id')
      .innerJoin('academic_years', 'class_students.academic_year_id', 'academic_years.id')
      .if(params?.tahunAjarId, (query) =>
        query.where('class_students.academic_year_id', params.tahunAjarId)
      )

    switch (params?.sortBy) {
      case 'kelas':
        scoresQuery
          .orderBy('academic_years.status', 'desc')
          .orderBy('classes.name', params.sortOrder || 'asc')
        break
      case 'mapel':
        scoresQuery
          .orderBy('academic_years.status', 'desc')
          .orderBy('modules.name', params.sortOrder || 'asc')
        break
      default:
        scoresQuery
          .orderBy('academic_years.status', 'desc')
          .orderBy(params.sortBy || 'scores.id', params.sortOrder || 'asc')
        break
    }

    return await scoresQuery.paginate(params.page || 1, params.limit || 10)
  }

  async getOne(id: number): Promise<any> {
    const scores = await Score.query().where('id', id).firstOrFail()

    return scores
  }

  async getOwnScores(user: any): Promise<any> {
    const student = await Student.query().where('user_id', user.id).firstOrFail()
    const classStudentIds = (await ClassStudent.query().where('student_id', student.id)).map(
      (cs) => cs.id
    )
    const academicYearIds = (await ClassStudent.query().whereIn('id', classStudentIds)).map(
      (cs) => cs.academicYearId
    )

    const academicYears = await AcademicYear.query().whereIn('id', academicYearIds)
    const schedules = await Schedule.query().whereIn(
      'class_id',
      (await ClassStudent.query().whereIn('id', classStudentIds)).map((cs) => cs.classId)
    )
    const modules = await Module.query()
      .whereIn(
        'id',
        schedules.map((item) => item.moduleId)
      )
      .select('id', 'name', 'academic_year_id')

    const scores = await Score.query().whereIn('class_student_id', classStudentIds)
    const scoreTypes = await ScoreType.query()

    const result = academicYears.map(
      (
        academicYear
      ): {
        academicYear: {
          id: number
          name: string
          semester: string
          status: boolean
        }
        modules: {
          id: number
          name: string
          scores: {
            taskList: number[]
            task: number | null
            uts: number | null
            uas: number | null
            totalList: Array<{ type: number; score: number }>
            total: number | null
          }
        }[]
      } => ({
        academicYear: {
          id: academicYear.id,
          name: academicYear.name,
          semester: academicYear.semester,
          status: academicYear.status,
        },
        modules: [],
      })
    )

    for (const element of result) {
      const moduleMap = new Map<
        number,
        {
          id: number
          name: string
          scores: {
            taskList: number[]
            task: number | null
            uts: number | null
            uas: number | null
            totalList: Array<{ type: number; score: number }>
            total: number | null
          }
        }
      >()

      for (const module of modules) {
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
              data.scores.uts = score.score
              type = 2
            } else if (score.scoreTypeId === 3) {
              data.scores.uas = score.score
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
          data.scores.task = Math.round(taskAvg)
        }

        if (data.scores.totalList.length > 0) {
          const totalScore = data.scores.totalList.reduce((sum, val) => {
            const weight = scoreTypes.find((st) => st.id === val.type)?.weight || 0
            return sum + (val.score * weight) / 100
          }, 0)
          data.scores.total = Math.round(totalScore)
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
