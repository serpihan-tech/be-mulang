import Class from "#models/class"
import { updateClassValidator } from "#validators/class"
import db from "@adonisjs/lucid/services/db"

export class ClassService {
  async get(column: string[], page: number, limit?: number, classId?: number) {
    if (classId) {
      const theClass = await db.from('classes').where('id', classId).select(column).paginate(page, limit)
      return theClass
    }
    const theClass = await db.from('classes').select(column).paginate(page, limit)
    return theClass
  }

  async create( data:any ):Promise<any> {
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

  async update(data: any, classId: number):Promise<any> {
    const trx = await db.transaction()
    try {
      const theClass = await Class.findOrFail(classId)
      theClass.merge(data)
      await theClass.useTransaction(trx).save()

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
}
