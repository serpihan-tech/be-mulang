import Class from "#models/class"
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

  async update(data: any, classId: number):Promise<any> {
    const theClass = await Class.findOrFail(classId)
    theClass.merge(data)
    return await theClass.save()
  }

  async delete(id: number) { 
    const theClass = await Class.query().where('id', id).firstOrFail()
    return await theClass.delete()
  }
}
