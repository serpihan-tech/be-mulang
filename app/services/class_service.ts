import Class from '#models/class'
import db from '@adonisjs/lucid/services/db'

export class ClassService {
  async get(page: number, limit?: number, classId?: number) {
    if (classId) {
      const theClass = await Class.query()
        .select('id', 'name', 'teacher_id')
        .where('id', classId)
        .preload('teacher', (t) => t.select('id', 'name'))
        .first()

      if (!theClass) throw new Error('Kelas tidak ditemukan')

      return theClass
    }
    const theClass = await Class.query()
      .select('id', 'name', 'teacher_id')
      .withCount('classStudent', (cs) => cs.as('total_student'))
      .preload('teacher', (t) => t.select('id', 'name'))
      .paginate(page, limit)

    const formattedData = theClass.all().map((item) => ({
      id: item.id,
      name: item.name,
      teacherId: item.teacher_id,
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
    return await theClass
  }
}
