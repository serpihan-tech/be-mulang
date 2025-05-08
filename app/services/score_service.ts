import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'
import Student from '#models/student'
import ClassStudent from '#models/class_student'
import Module from '#models/module'
import AcademicYear from '#models/academic_year'
import Schedule from '#models/schedule'
import ScoreType from '#models/score_type'
import Teacher from '#models/teacher'
import Class from '#models/class'
import { DateTime } from 'luxon'

export default class ScoreService {
  private async getActiveSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    // console.log(now)

    return await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }
  async getAll(params: any | undefined): Promise<any> {
    // bisa dapetin semua score per kelas berdasarkan semester
    const paramsMapel = params.mapel
    const paramsKelas = params.kelas

    const semester = params.tahunAjar
      ? await AcademicYear.query().where('id', params.tahunAjar).firstOrFail()
      : await this.getActiveSemester()

    const classStudent = await ClassStudent.query()
      .where('academic_year_id', semester.id)
      .if(params.kelas, (q) =>
        q
          .if(Array.isArray(params.kelas), (p) => p.whereIn('class_id', paramsKelas))
          .if(!Array.isArray(params.kelas), (p) => p.where('class_id', params.kelas))
      )

    const scoreTypes = await ScoreType.query()
    const score = await Score.query()
      .preload('scoreType')
      .preload('classStudent', (cs) => {
        cs.preload('student', (s) => s.preload('studentDetail'))
        cs.preload('class')
      })
      .preload('module')
      .where(
        'class_student_id',
        'in',
        classStudent.map((cs) => cs.id)
      )
      .if(params.mapel, (q) =>
        q
          .if(Array.isArray(params.mapel), (p) => p.whereIn('module_id', paramsMapel))
          .if(!Array.isArray(params.mapel), (p) => p.where('module_id', params.mapel))
      )
      .orderBy('module_id', 'asc')

    const result = {
      semester: {
        id: semester.id,
        name: semester.name,
        semester: semester.semester,
        status: semester.status,
      },
      data: score.reduce(
        (acc, curr) => {
          const index = acc.findIndex(
            (item) =>
              item.module.id === curr.module.id &&
              item.student.id === curr.classStudent.student.id &&
              item.classStudentId === curr.classStudent.id
          )
          if (index === -1) {
            let groupedResult: any = {
              classStudentId: curr.classStudent.id,
              module: {
                id: curr.module.id,
                name: curr.module.name,
              },
              student: {
                id: curr.classStudent.student.id,
                name: curr.classStudent.student.name,
                nis: curr.classStudent.student.studentDetail.nis,
              },
              theClass: {
                id: curr.classStudent.class.id,
                name: curr.classStudent.class.name,
              },
              scores: {
                totalList: [
                  {
                    score: curr.score,
                    scoreType: {
                      id: curr.scoreType.id,
                      name: curr.scoreType.name,
                    },
                  },
                ],
                taskList: [],
                task: null,
                uts: null,
                uas: null,
                total: null,
              },
            }

            if (curr.scoreType.id === 2) {
              groupedResult.scores.uts = curr.score
            } else if (curr.scoreType.id === 3) {
              groupedResult.scores.uas = curr.score
            } else if (curr.scoreType.id === 1) {
              groupedResult.scores.taskList.push({
                score: curr.score,
                scoreType: {
                  id: curr.scoreType.id,
                  name: curr.scoreType.name,
                },
              })
            }

            if (groupedResult.scores.taskList.length > 0) {
              groupedResult.scores.task =
                groupedResult.scores.taskList.reduce(
                  (acc2: any, curr2: any) => acc2 + curr2.score,
                  0
                ) / scoreTypes.filter((item) => item.id === 1)[0].taskQuota
            }

            if (groupedResult.scores.totalList.length > 0) {
              const taskTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 1)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 1)[0].weight,
              }

              const utsTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 2)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 2)[0].weight,
              }

              const uasTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 3)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 3)[0].weight,
              }

              groupedResult.scores.total =
                (taskTotalSum.score / scoreTypes.filter((st) => st.id === 1)[0].taskQuota) *
                  (taskTotalSum.weight / 100) +
                (utsTotalSum.score * (utsTotalSum.weight / 100) +
                  uasTotalSum.score * (uasTotalSum.weight / 100))

              groupedResult.scores.total = Number(groupedResult.scores.total.toFixed(2))
            }

            acc.push(groupedResult)
          } else {
            let groupedResult: any = acc[index]
            acc[index].scores?.totalList.push({
              score: curr.score,
              scoreType: {
                id: curr.scoreType.id,
                name: curr.scoreType.name,
              },
            })
            if (curr.scoreType.id === 2) {
              groupedResult.scores.uts = curr.score
            } else if (curr.scoreType.id === 3) {
              groupedResult.scores.uas = curr.score
            } else if (curr.scoreType.id === 1) {
              groupedResult.scores.taskList.push({
                score: curr.score,
                scoreType: {
                  id: curr.scoreType.id,
                  name: curr.scoreType.name,
                },
              })
            }

            if (groupedResult.scores.taskList.length > 0) {
              groupedResult.scores.task =
                groupedResult.scores.taskList.reduce(
                  (acc2: any, curr2: any) => acc2 + curr2.score,
                  0
                ) / scoreTypes.filter((item) => item.id === 1)[0].taskQuota
            }

            if (groupedResult.scores.totalList.length > 0) {
              const taskTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 1)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 1)[0].weight,
              }

              const utsTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 2)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 2)[0].weight,
              }

              const uasTotalSum: any = {
                score:
                  groupedResult.scores.totalList
                    .filter((task: any) => task.scoreType.id === 3)
                    .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
                weight: scoreTypes.filter((item) => item.id === 3)[0].weight,
              }

              groupedResult.scores.total =
                (taskTotalSum.score / scoreTypes.filter((st) => st.id === 1)[0].taskQuota) *
                  (taskTotalSum.weight / 100) +
                (utsTotalSum.score * (utsTotalSum.weight / 100) +
                  uasTotalSum.score * (uasTotalSum.weight / 100))

              groupedResult.scores.total = Number(groupedResult.scores.total.toFixed(2))
            }
          }
          return acc
        },
        [] as {
          classStudentId: number
          module: {
            id: number
            name: string
          }
          student: {
            id: number
            name: string
            nis: string
          }
          theClass: {
            id: number
            name: string
          }
          scores: {
            taskList: {
              score: number | any
              scoreType: { id: number; name: string }
            }[]
            task: null | any
            uts: null | any
            uas: null | any
            totalList: {
              score: number | any
              scoreType: { id: number; name: string }
            }[]
            total: null | any
          }
        }[]
      ),
    }

    return result
  }

  async getOne(id: number): Promise<any> {
    const scores = await Score.query().where('id', id).firstOrFail()

    return scores
  }

  async getOwnScores(user: any, params: any): Promise<any> {
    // Find the student user
    const student = await Student.query().where('user_id', user.id).firstOrFail()

    const scoreTypes = await ScoreType.query()
    // Find the class student from student result
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
      .if(params.tahunAjar, (q) => q.where('modules.academic_year_id', params.tahunAjar))

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
      .innerJoin('class_students', 'scores.class_student_id', 'class_students.id')
      .innerJoin('academic_years', 'modules.academic_year_id', 'academic_years.id')
      .if(params.tahunAjar, (q) => q.where('academic_years.id', params.tahunAjar))

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

    let result = scoreResult.serialize().data.map((item) => {
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
    if (params.tahunAjar) {
      result = result.filter((item) => {
        return item.academicYear.id === Number(params.tahunAjar)
      })
    }

    const taskScoreType = await ScoreType.query().where('id', 1).firstOrFail()

    let groupedResult = result.reduce((acc, item) => {
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

      moduleGroup.scores.totalList.push({
        score: module.score,
        description: module.description,
        scoreType: {
          id: scoreType.id,
          name: scoreType.name,
        },
      })

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
          const taskLength = module.scores.totalList.filter((task: any) => task.sTid === 1).length
          const taskTotalSum: any = {
            score:
              module.scores.totalList
                .filter((task: any) => task.sTid === 1)
                .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
            weight: scoreTypes.filter((item) => item.id === 1)[0].weight,
          }

          const utsTotalSum: any = {
            score:
              module.scores.totalList
                .filter((task: any) => task.sTid === 2)
                .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
            weight: scoreTypes.filter((item) => item.id === 2)[0].weight,
          }

          const uasTotalSum: any = {
            score:
              module.scores.totalList
                .filter((task: any) => task.sTid === 3)
                .reduce((sum: number, val: { score: number }) => sum + val.score, 0) || 0,
            weight: scoreTypes.filter((item) => item.id === 3)[0].weight,
          }

          module.scores.total =
            (taskTotalSum.score / taskLength) * (taskTotalSum.weight / 100) +
            (utsTotalSum.score * (utsTotalSum.weight / 100) +
              uasTotalSum.score * (uasTotalSum.weight / 100))

          module.scores.total = Number(module.scores.total.toFixed(2))
        }
      })
    })

    return result
  }

  async getMyScoring(params: any, user: any) {
    const teacher = await Teacher.query().where('user_id', user.id).firstOrFail()
    const ac = await AcademicYear.query().orderBy('status', 'desc')

    const modules = await Module.query()
      .where('teacher_id', teacher.id)
      .whereIn(
        'academic_year_id',
        ac.map((ay) => ay.id)
      )

    const score = await Score.query()
      .preload('scoreType')
      .whereIn(
        'module_id',
        modules.map((m) => m.id)
      )
      .preload('classStudent', (cs) => {
        cs.preload('student')
      })
    const schedule = await Schedule.query()
      .whereIn(
        'module_id',
        modules.map((m) => m.id)
      )
      .preload('class')

    const scoreTypes = await ScoreType.query()

    const result = ac.map((ay) => {
      const filteredModules = modules.filter((m) => m.academicYearId === ay.id)

      return {
        academicYear: ay,
        modules: filteredModules.map((m) => {
          const filteredSchedules = schedule.filter((s) => s.moduleId === m.id)

          return {
            module: m,
            schedule: filteredSchedules.map((sch) => {
              const relatedScores = score.filter((sc) => {
                return sc.moduleId === sch.moduleId && sc.classStudent.classId === sch.classId
              })

              return {
                ...sch.serialize(), // schedule fields
                scores: relatedScores
                  .filter((rSc) =>
                    rSc.serialize().classStudent.academicYearId === ay.id ? rSc.serialize() : null
                  )
                  .reduce(
                    (rsPrev: any, rsCurrent: any) => {
                      rsPrev.taskList =
                        rsCurrent.scoreTypeId === 1
                          ? [
                              ...rsPrev.taskList,
                              {
                                score: rsCurrent.score,
                                description: rsCurrent.description,
                                scoreType: {
                                  id: rsCurrent.scoreType.id,
                                  name: rsCurrent.scoreType.name,
                                },
                              },
                            ]
                          : rsPrev.taskList

                      rsPrev.task =
                        rsPrev.taskList.length > 0
                          ? rsPrev.taskList.reduce(
                              (taskP: any, taskC: any) => taskP + taskC.score,
                              0
                            ) / scoreTypes.filter((st) => st.id === 1)[0].taskQuota
                          : null
                      rsPrev.uts = rsCurrent.scoreTypeId === 2 ? rsCurrent.score : null
                      rsPrev.uas = rsCurrent.scoreTypeId === 3 ? rsCurrent.score : null
                      rsPrev.totalList = [
                        ...rsPrev.totalList,
                        {
                          score: rsCurrent.score,
                          description: rsCurrent.description,
                          scoreType: {
                            id: rsCurrent.scoreType.id,
                            name: rsCurrent.scoreType.name,
                          },
                        },
                      ]

                      if (rsPrev.totalList.length > 0) {
                        const taskTotalSum: any = {
                          score:
                            rsPrev.totalList
                              .filter((task: any) => task.scoreType.id === 1)
                              .reduce(
                                (sum: number, val: { score: number }) => sum + val.score,
                                0
                              ) || 0,
                          weight: scoreTypes.filter((item) => item.id === 1)[0].weight,
                        }

                        const utsTotalSum: any = {
                          score:
                            rsPrev.totalList
                              .filter((task: any) => task.scoreType.id === 2)
                              .reduce(
                                (sum: number, val: { score: number }) => sum + val.score,
                                0
                              ) || 0,
                          weight: scoreTypes.filter((item) => item.id === 2)[0].weight,
                        }

                        const uasTotalSum: any = {
                          score:
                            rsPrev.totalList
                              .filter((task: any) => task.scoreType.id === 3)
                              .reduce(
                                (sum: number, val: { score: number }) => sum + val.score,
                                0
                              ) || 0,
                          weight: scoreTypes.filter((item) => item.id === 3)[0].weight,
                        }

                        rsPrev.total =
                          (taskTotalSum.score /
                            scoreTypes.filter((st) => st.id === 1)[0].taskQuota) *
                            (taskTotalSum.weight / 100) +
                          (utsTotalSum.score * (utsTotalSum.weight / 100) +
                            uasTotalSum.score * (uasTotalSum.weight / 100))

                        rsPrev.total = Number(rsPrev.total.toFixed(2))
                      }
                      return rsPrev
                    },
                    {
                      taskList: [],
                      task: null,
                      uts: null,
                      uas: null,
                      totalList: [],
                      total: null,
                    }
                  ),
              }
            }),
          }
        }),
      }
    })

    return {
      result,
    }
  }

  async getRecapScoring(params: any, user: any) {
    const teacher = await Teacher.query().where('user_id', user.id).firstOrFail()
    const classes = await Class.query().where('teacher_id', teacher.id).firstOrFail()

    const schedule = await Schedule.query()
      .where('class_id', classes.id)
      .preload('module')
      .select('module_id', 'class_id')

    const ac = await AcademicYear.query().orderBy('status', 'desc')

    const classStudent = await ClassStudent.query().where('class_id', classes.id).preload('student')
    const score = await Score.query()
      .preload('scoreType')
      .whereIn(
        'module_id',
        schedule.map((s) => s.module.id)
      )

    const scoreTypes = await ScoreType.query()

    const result = ac.map((ay) => {
      const filteredSchedule = schedule.filter((s) => {
        return s.module.academicYearId === ay.id
      })

      return {
        academicYear: ay,
        modules: filteredSchedule.map((s) => {
          const filteredClassStudent = classStudent.filter((cs) => {
            return cs.academicYearId === s.module.academicYearId
          })

          return {
            module: {
              id: s.module.id,
              name: s.module.name,
            },
            classStudents: filteredClassStudent.map((cs) => {
              const relatedScores = score.filter((sc) => {
                return sc.moduleId === s.module.id && sc.classStudentId === cs.id
              })

              return {
                ...cs.serialize(), // class student fields
                scores: relatedScores.reduce(
                  (rsPrev: any, rsCurrent: any) => {
                    rsPrev.taskList =
                      rsCurrent.scoreTypeId === 1
                        ? [
                            ...rsPrev.taskList,
                            {
                              score: rsCurrent.score,
                              description: rsCurrent.description,
                              scoreType: {
                                id: rsCurrent.scoreType.id,
                                name: rsCurrent.scoreType.name,
                              },
                            },
                          ]
                        : rsPrev.taskList

                    rsPrev.task =
                      rsPrev.taskList.length > 0
                        ? rsPrev.taskList.reduce(
                            (taskP: any, taskC: any) => taskP + taskC.score,
                            0
                          ) / scoreTypes.filter((st) => st.id === 1)[0].taskQuota
                        : null
                    rsPrev.uts = rsCurrent.scoreTypeId === 2 ? rsCurrent.score : null
                    rsPrev.uas = rsCurrent.scoreTypeId === 3 ? rsCurrent.score : null
                    rsPrev.totalList = [
                      ...rsPrev.totalList,
                      {
                        score: rsCurrent.score,
                        description: rsCurrent.description,
                        scoreType: {
                          id: rsCurrent.scoreType.id,
                          name: rsCurrent.scoreType.name,
                        },
                      },
                    ]

                    if (rsPrev.totalList.length > 0) {
                      const taskTotalSum: any = {
                        score:
                          rsPrev.totalList
                            .filter((task: any) => task.scoreType.id === 1)
                            .reduce((sum: number, val: { score: number }) => sum + val.score, 0) ||
                          0,
                        weight: scoreTypes.filter((item) => item.id === 1)[0].weight,
                      }

                      const utsTotalSum: any = {
                        score:
                          rsPrev.totalList
                            .filter((task: any) => task.scoreType.id === 2)
                            .reduce((sum: number, val: { score: number }) => sum + val.score, 0) ||
                          0,
                        weight: scoreTypes.filter((item) => item.id === 2)[0].weight,
                      }

                      const uasTotalSum: any = {
                        score:
                          rsPrev.totalList
                            .filter((task: any) => task.scoreType.id === 3)
                            .reduce((sum: number, val: { score: number }) => sum + val.score, 0) ||
                          0,
                        weight: scoreTypes.filter((item) => item.id === 3)[0].weight,
                      }

                      rsPrev.total =
                        (taskTotalSum.score / scoreTypes.filter((st) => st.id === 1)[0].taskQuota) *
                          (taskTotalSum.weight / 100) +
                        (utsTotalSum.score * (utsTotalSum.weight / 100) +
                          uasTotalSum.score * (uasTotalSum.weight / 100))

                      rsPrev.total = Number(rsPrev.total.toFixed(2))
                    }
                    return rsPrev
                  },
                  {
                    taskList: [],
                    task: null,
                    uts: null,
                    uas: null,
                    totalList: [],
                    total: null,
                  }
                ), // attach related scores
              }
            }),
          }
        }),
      }
    })

    return result
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
