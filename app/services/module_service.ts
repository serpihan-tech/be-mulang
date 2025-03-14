import db from '@adonisjs/lucid/services/db'
import Module from '#models/module'

export default class ModuleService {
  async getAll(params: any, page?: number, limit?: number): Promise<any> {
    const dataModule = await Module.filter(params).paginate(page || 1, limit || 1)

    return dataModule
  }

  async getOne(id: any): Promise<any> {
    const module = await Module.query().where('id', id).firstOrFail()

    return module
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    const modules = await Module.create(data, { client: trx })
    await trx.commit()

    return modules
  }

  async update(data: any, id: number): Promise<any> {
    const trx = await db.transaction()
    const modules = await Module.findOrFail(id, { client: trx })
    modules.merge(data)
    await modules.useTransaction(trx).save()
    await trx.commit()

    return modules
  }

  async delete(id: number): Promise<any> {
    const modules = await Module.findOrFail(id)

    await modules.delete()
  }
}
