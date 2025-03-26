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
  async getAll(params?: any): Promise<any> {
    // get class by classstudent id
    //filter by status academicyear == 1
    let scores = Score.filter(params)
      .preload('classStudent', (cs) =>
        cs
          .preload('class', (c) => c.preload('teacher', (t) => t.select('id', 'name')))
          .preload('academicYear', (ay) =>
            ay.select('id', 'name', 'dateStart', 'dateEnd', 'semester', 'status')
          )
      )
      .preload('module')
      .preload('scoreType')

    // Academic Year by ClassStudent.AcademicYear
    const orderByActiveStatus = (query: any) => {
      return query
        .innerJoin('class_students', 'scores.class_student_id', 'class_students.id')
        .innerJoin('classes', 'class_students.class_id', 'classes.id')
        .innerJoin('modules', 'scores.module_id', 'modules.id')
        .innerJoin('academic_years', 'class_students.academic_year_id', 'academic_years.id')
        .orderBy('academic_years.status', 'desc')
    }

    // Academic Year by Module.AcademicYear
    // const orderByModule = (query: any) => {
    //   return query
    //     .innerJoin('class_students', 'scores.class_student_id', 'class_students.id')
    //     .innerJoin('classes', 'class_students.class_id', 'classes.id')
    //     .innerJoin('modules', 'scores.module_id', 'modules.id')
    //     .innerJoin('academic_years', 'modules.academic_year_id', 'academic_years.id')
    //     .orderBy('academic_years.status', 'desc')
    // }

    switch (params?.sortBy) {
      case 'kelas':
        orderByActiveStatus(scores).orderBy('classes.name', params.sortOrder || 'asc')
        break
      case 'mapel':
        orderByActiveStatus(scores).orderBy('modules.name', params.sortOrder || 'asc')
        break
      default:
        orderByActiveStatus(scores)
    }

    return await scores.paginate(params.page || 1, params.limit || 10)
  }

  async getOne(id: number): Promise<any> {
    const scores = await Score.query().where('id', id).firstOrFail()

    return scores
  }

  async getOwnScores(user: any, params?: any): Promise<any> {
    const student = await Student.query().where('user_id', user.id).firstOrFail()
    const classStudents = await ClassStudent.query()
      .where('student_id', student.id)
      .orderBy('academic_year_id', 'desc')

    const classStudentIds = classStudents.map((cs) => cs.id)
    const academicYearIds = classStudents.map((cs) => cs.academicYearId)

    const academicYearFilter = params?.tahunAjar ? [params.tahunAjar] : academicYearIds

    if (academicYearFilter.length === 0) {
      throw new Error('Tidak ada tahun ajaran yang valid')
    }

    const academicYears = await AcademicYear.query()
      .whereIn('id', academicYearFilter)
      .orderBy('status', 'desc')
      .orderBy('id', 'desc')

    const classIds = classStudents.map((cs) => cs.classId)
    const schedules = await Schedule.query().whereIn('class_id', classIds)
    const moduleIds = schedules.map((s) => s.moduleId)
    const modules = await Module.query()
      .whereIn('id', moduleIds)
      .select('id', 'name', 'academic_year_id')

    const scores = await Score.query().whereIn('class_student_id', classStudentIds)
    const scoreTypes = await ScoreType.query()

    return academicYears.map((academicYear) => {
      const moduleMap = new Map<number, any>()

      for (const module of modules) {
        if (module.academicYearId !== academicYear.id) continue

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

      for (const score of scores) {
        const moduleData = moduleMap.get(score.moduleId)
        if (!moduleData) continue

        if (score.scoreTypeId === 1) {
          moduleData.scores.taskList.push(score.score)
        } else if (score.scoreTypeId === 2) {
          moduleData.scores.uts = score.score
        } else if (score.scoreTypeId === 3) {
          moduleData.scores.uas = score.score
        }
      }

      moduleMap.forEach((module) => {
        if (module.scores.taskList.length > 0) {
          module.scores.task = Math.round(
            module.scores.taskList.reduce((sum: any, val: any) => sum + val, 0) /
              module.scores.taskList.length
          )
        }

        module.scores.totalList = []
        if (module.scores.task !== null) {
          const weight = scoreTypes.find((st) => st.id === 1)?.weight || 0
          module.scores.totalList.push({ type: 1, score: (module.scores.task * weight) / 100 })
        }
        if (module.scores.uts !== null) {
          const weight = scoreTypes.find((st) => st.id === 2)?.weight || 0
          module.scores.totalList.push({ type: 2, score: (module.scores.uts * weight) / 100 })
        }
        if (module.scores.uas !== null) {
          const weight = scoreTypes.find((st) => st.id === 3)?.weight || 0
          module.scores.totalList.push({ type: 3, score: (module.scores.uas * weight) / 100 })
        }

        if (module.scores.totalList.length > 0) {
          module.scores.total = Math.round(
            module.scores.totalList.reduce((sum: any, val: { score: any }) => sum + val.score, 0)
          )
        }
      })

      return {
        academicYear: {
          id: academicYear.id,
          name: academicYear.name,
          semester: academicYear.semester,
          status: academicYear.status,
        },
        modules: Array.from(moduleMap.values()),
      }
    })
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
