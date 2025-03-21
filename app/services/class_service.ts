import Class from '#models/class'
import db from '@adonisjs/lucid/services/db'
import ClassContract from '../contracts/class_contract.js'
import ModelFilter from '../utils/filter_query.js'

export class ClassService implements ClassContract {
  async getAll(params?: any) {
    const theClass = await Class.filter(params)
      .select('id', 'name', 'teacher_id')
      .withCount('classStudent', (cs) => cs.as('total_student'))
      .preload('teacher', (t) => t.select('id', 'name'))
      .paginate(params.page || 1, params.limit || 10)

    const formattedData = theClass.all().map((item) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacherId,
      teacher: {
        id: item.teacher.id,
        name: item.teacher.name,
      },
      totalStudents: item.$extras.total_student,
    }))

    return {
      meta: theClass.getMeta(),
      theClass: formattedData,
    }
  }

  async getOne(id: number) {
    const theClass = await Class.query()
      .where('id', id)
      .select('id', 'name', 'teacher_id')
      .withCount('classStudent', (cs) => cs.as('total_student'))
      .preload('teacher', (t) => t.select('id', 'name'))
      .firstOrFail()

    const formattedData = {
      id: theClass.id,
      name: theClass.name,
      teacherId: theClass.teacherId,
      teacher: {
        id: theClass.teacher.id,
        name: theClass.teacher.name,
      },
      totalStudents: theClass.$extras.total_student,
    }

    return formattedData
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const theClass = await Class.create(data, { client: trx })
      await trx.commit()
      return theClass
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(data: any, classId: number): Promise<any> {
    const trx = await db.transaction()
    try {
      const theClass = await Class.query({ client: trx }).where('id', classId).firstOrFail()
      theClass.merge({
        name: data.name ?? theClass.name,
        teacherId: data.teacher_id ?? theClass.teacherId,
      })

      await theClass.useTransaction(trx).save()
      await trx.commit()
      return theClass
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number) {
    const theClass = await Class.query().where('id', id).firstOrFail()
    return await theClass.delete()
  }

  async countAllStudents(classId: number) {
    const theClass = await Class.query().where('id', classId).firstOrFail()
    return theClass
  }
}
