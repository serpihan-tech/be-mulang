import db from "@adonisjs/lucid/services/db";
import ModuleContract from "../contracts/module_contract.js";
import Module from "#models/module";

export default class ModuleService implements ModuleContract{
  async get(id?: number): Promise<any> {
    try {
      if (id) {
        const dataModule = await db.from('modules').where('id', id).select('*')
        return dataModule
      }
      const modules = await db.from('modules').select('*')
      return modules
      
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }
  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const modules = await Module.create(data, { client: trx })
      await trx.commit()
      return modules
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }
  async update(id: number, data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const modules = await Module.findOrFail(id, { client: trx })
      modules.merge(data)
      await modules.useTransaction(trx).save()
      await trx.commit()
      return modules

    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }
  async delete(id: number): Promise<any> {
    try {
      const modules = await Module.findOrFail(id)
      await modules.delete()
    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }
}