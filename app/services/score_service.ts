import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'
import Student from '#models/student'
import ClassStudent from '#models/class_student'
import Module from '#models/module'
import AcademicYear from '#models/academic_year'
import Schedule from '#models/schedule'
import ScoreType from '#models/score_type'
import { messages } from '../utils/validation_message.js'
import Teacher from '#models/teacher'
import { Database } from '@adonisjs/lucid/database'

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

  async getOwnScores(user: any, params?: any): Promise<any> {
    const student = await Student.query().where('user_id', user.id).firstOrFail()
    // to string
    const [...classStudentsIds] = await ClassStudent.query()
      .select('id', 'academic_year_id', 'class_id')
      .where('student_id', student.id)

    const schedulesQuery = Schedule.query()
      .preload('module', (moduleQuery) =>
        moduleQuery
          .select('id', 'name', 'academic_year_id')
          .preload('academicYear', (acQuery) => acQuery.select('id', 'name', 'status', 'semester'))
      )
      .preload('class', (classQuery) => classQuery.select('id', 'name'))
      .innerJoin('modules', 'schedules.module_id', 'modules.id')
      .innerJoin('classes', 'schedules.class_id', 'classes.id')
      .innerJoin('academic_years', 'modules.academic_year_id', 'academic_years.id')

    classStudentsIds.forEach((cs, index) => {
      if (index === 0) {
        schedulesQuery.where((builder) => {
          builder
            .where('schedules.class_id', cs.classId)
            .andWhere('modules.academic_year_id', cs.academicYearId)
        })
      } else {
        schedulesQuery.orWhere((builder) => {
          builder
            .where('schedules.class_id', cs.classId)
            .andWhere('modules.academic_year_id', cs.academicYearId)
        })
      }
    })

    const schedulesPaginated = await schedulesQuery
      .orderBy('academic_years.status', 'desc')
      .paginate(1, 20)

    const ids = schedulesPaginated.serialize().data.map((item) => {
      return {
        moduleId: item.module.id || null,
        academicYearId: item.module.academicYearId || null,
        classId: item.class.id || null,
      }
    })

    const score = Score.query()
      .whereIn(
        'class_student_id',
        classStudentsIds.map((cs) => cs.id)
      )
      .preload('classStudent', (cs) =>
        cs
          .select('id', 'class_id', 'academic_year_id')
          .preload('academicYear', (ay) => ay.select('id', 'name', 'status', 'semester'))
          .preload('class', (c) => c.select('id', 'name'))
      )
      .preload('module', (mq) => mq.select('id', 'name', 'academic_year_id'))
      .preload('scoreType')
      .innerJoin('modules', 'scores.module_id', 'modules.id')
      .innerJoin('class_students', 'scores.class_student_id', 'class_students.id') // ✅ JOIN ini wajib!
      .innerJoin('academic_years', 'modules.academic_year_id', 'academic_years.id')

    // Build dynamic where
    ids.forEach((cs, index) => {
      if (index === 0) {
        score.where((builder) => {
          builder
            .where('modules.academic_year_id', cs.academicYearId)
            .andWhere('class_students.academic_year_id', cs.academicYearId)
            .andWhere('class_students.class_id', cs.classId)
        })
      } else {
        score.orWhere((builder) => {
          builder
            .where('modules.academic_year_id', cs.academicYearId)
            .andWhere('class_students.academic_year_id', cs.academicYearId)
            .andWhere('class_students.class_id', cs.classId)
        })
      }
    })

    const scoreResult = await score.orderBy('academic_years.status', 'desc').paginate(1, 20)

    const result = scoreResult.serialize().data.map((item) => {
      const { module, classStudent, ...rest } = item
      const academicYear = classStudent?.academicYear || null

      return {
        academicYear: academicYear,
        module: {
          id: module.id,
          name: module.name,
          academicYearId: module.academicYearId,
          score: item.score,
          description: item.description,
        },
        scoreType: item.scoreType,
      }
    })

    const taskScoreType = await ScoreType.query().where('id', 1).firstOrFail()

    const groupedResult = result.reduce((acc, item) => {
      const { academicYear, module, scoreType } = item

      // Cari academicYear
      let yearGroup = acc.find((a) => a.academicYear.id === academicYear.id)
      if (!yearGroup) {
        yearGroup = {
          academicYear: {
            id: academicYear.id,
            name: academicYear.name,
            semester: academicYear.semester,
            status: academicYear.status,
          },
          modules: [],
        }
        acc.push(yearGroup)
      }

      // Cari module di academicYear itu
      let moduleGroup = yearGroup.modules.find((m: any) => m.id === module.id)
      if (!moduleGroup) {
        moduleGroup = {
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
        }
        yearGroup.modules.push(moduleGroup)
      }

      // Masukkan score ke dalam tempat yang tepat
      const scoreData = {
        score: module.score,
        description: module.description,
        scoreType: scoreType.name,
      }

      if (scoreType.name.toLowerCase().includes('tugas')) {
        moduleGroup.scores.taskList.push(scoreData)
      } else if (scoreType.name.toLowerCase().includes('uts')) {
        moduleGroup.scores.uts = scoreData
      } else if (scoreType.name.toLowerCase().includes('uas')) {
        moduleGroup.scores.uas = scoreData
      }

      moduleGroup.scores.totalList.push(module.score)

      return acc
    }, [] as any[])

    // Optionally, hitung total average
    groupedResult.forEach((yearGroup) => {
      yearGroup.modules.forEach((module: any) => {
        if (module.scores.taskList.length > 0) {
          // const totalSum = module.scores.taskList.reduce((sum: number, val: number) => sum + val, 0)
          const totalSum = module.scores.taskList
            .map((task: any) => {
              return task.score
            })
            .reduce((sum: number, val: number) => sum + val, 0)
          module.scores.task = totalSum / module.scores.taskList.length
        }
        const a = taskScoreType.taskQuota - module.scores.taskList.length
        //for null value
        if (taskScoreType.taskQuota !== module.scores.taskList.length) {
          for (let i = 0; i < a; i++) {
            module.scores.taskList.push({
              score: null,
              description: null,
              scoreType: null,
            })
          }
        }
      })
    })

    groupedResult.forEach((yearGroup) => {
      yearGroup.modules.forEach((module: any) => {
        if (module.scores.totalList.length > 0) {
          const totalSum = module.scores.totalList.reduce(
            (sum: number, val: number) => sum + val,
            0
          )
          module.scores.total = totalSum / module.scores.totalList.length
        }
      })
    })

    // Akhirnya return groupedResult
    return {
      meta: scoreResult.serialize().meta,
      data: groupedResult,
    }

    // return {
    //   meta: scoreResult.serialize().meta,
    //   data: result,
    // }

    // return score
  }

  async getMyScoring(params: any, user: any) {
    const teacher = await Teacher.query().where('user_id', user.id).firstOrFail()
    const modules = await Module.query().where('teacher_id', teacher.id)
    // TODO: find score by the module id
    const scores = await Score.query()
      .preload('scoreType')
      .preload('classStudent', (cs) => {
        cs.preload('academicYear')
        cs.preload('class')
        cs.preload('student')
      })
      .preload('module')
      .whereIn(
        'module_id',
        modules.map((m) => m.id)
      )
      .innerJoin('class_students', 'scores.class_student_id', 'class_students.id')
      .innerJoin('academic_years', 'class_students.academic_year_id', 'academic_years.id')
      .innerJoin('classes', 'class_students.class_id', 'classes.id')
      .innerJoin('modules', 'scores.module_id', 'modules.id')
      .innerJoin('students', 'class_students.student_id', 'students.id')
      .if(params.mapel, (query) => {
        query.where('modules.name', 'like', `%${params.mapel}%`)
      })
      .if(params.kelas, (query) => {
        query.where('classes.name', 'like', `%${params.kelas}%`)
      })
      .if(params.search, (query) => {
        query.where('modules.name', 'like', `%${params.search}%`)
        query.orWhere('classes.name', 'like', `%${params.search}%`)
        query.orWhere('students.name', 'like', `%${params.search}%`)
      })
      .if(params.sortBy, (query) => {
        query.if(params.sortBy === 'kelas', (q) =>
          q.orderBy('classes.name', params.sortOrder || 'asc')
        )
        query.if(params.sortBy === 'mapel', (q) =>
          q.orderBy('modules.name', params.sortOrder || 'asc')
        )
      })
      .orderBy('academic_years.status', 'desc')
      .paginate(params.page || 1, params.limit || 10)

    return { scores }
  }

  async updateMyScoring(params: any, user: any) {
    const teacher = await Teacher.query().where('user_id', user.id).firstOrFail()
    const modules = await Module.query().where('teacher_id', teacher.id)
    const scores = await Score.query()
      .preload('scoreType')
      .preload('classStudent', (cs) => {
        cs.preload('academicYear')
        cs.preload('class')
        cs.preload('student')
      })
      .preload('module')
      .whereIn(
        'module_id',
        modules.map((m) => m.id)
      )
      .where('class_student_id', params.class_student_id)
      .where('module_id', params.module_id)
      .where('score_type_id', params.score_type_id)
      .firstOrFail()

    return { scores }
    // return academicYears.map((academicYear) => {
    //   const moduleMap = new Map<number, any>()

    //   for (const module of modules) {
    //     if (module.academicYearId !== academicYear.id) continue

    //     moduleMap.set(module.id, {
    //       id: module.id,
    //       name: module.name,
    //       scores: {
    //         taskList: [],
    //         task: null,
    //         uts: null,
    //         uas: null,
    //         totalList: [],
    //         total: null,
    //       },
    //     })
    //   }

    //   for (const score of scores) {
    //     const moduleData = moduleMap.get(score.moduleId)
    //     if (!moduleData) continue

    //     if (score.scoreTypeId === 1) {
    //       moduleData.scores.taskList.push(score.score)
    //     scoreTypeId: data.score_type_id,
    //     description: data.description,
    //   }, // Search criteria (harus unik)
    //   {
    //     score: data.score,
    //   } // Data yang akan diupdate
    // )
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
