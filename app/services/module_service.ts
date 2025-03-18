import db from '@adonisjs/lucid/services/db'
import Module from '#models/module'
import ModuleContract from '../contracts/module_contract.js'

export default class ModuleService implements ModuleContract {
  async getAll(params: any): Promise<any> {
    const formatedParams = {
      name: params.namaMapel,
    }
    const dataModule = await Module.filter(formatedParams)
      .if(params.tahunAjar, (query) => {
        query.whereHas('academicYear', (ayQuery) => {
          ayQuery.where('name', params.tahunAjar)
        })
      })
      .if(params.nip, (query) => {
        query.whereHas('teacher', (tQuery) => {
          tQuery.where('nip', params.nip)
        })
      })
      .preload('academicYear', (ay) =>
        ay.select('id', 'name', 'dateStart', 'dateEnd', 'semester', 'status')
      )
      .preload('teacher', (t) => t.select('id', 'name', 'nip'))
      .paginate(params.page || 1, params.limit || 10)

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
