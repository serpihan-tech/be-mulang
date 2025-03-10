import db from "@adonisjs/lucid/services/db";
import ModuleContract from "../contracts/module_contract.js";
import Module from "#models/module";
import Teacher from "#models/teacher";
import AcademicYear from "#models/academic_year";

export default class ModuleService {
  async get(columns?: string[], id?: number): Promise<any> {
    try {
      if (id) {
        const dataModule = await db.from('modules').where('id', id).select(columns ? columns : ['*'])
        return dataModule
      }
      const modules = await db.from('modules').select(columns ? columns : ['*'])
      return modules

    } catch (error) {
      throw new Error("Method not implemented.");
    }
  }

  async getByFilter(filter: any, page?: number, limit?: number, columns?: string[]): Promise<any> {
    let { name = "", teacherNip = "", academicYear = "" } = filter

    if (teacherNip) {
      const teacher = await Teacher.query().where('nip', teacherNip).first()
      teacherNip = teacher?.id || ""
    }

    if (academicYear) {
      const academicYearModel = await AcademicYear.query().where('name', academicYear).first()
      academicYear = academicYearModel?.id || ""
    }

    try {
      const modules = await Module.query()
      .if(name, (query) => {
        query.where('name', 'like', `%${name}%`)
      })
      .if(teacherNip, (query) => {
        query.where('teacher_id', teacherNip)
      })
      .if(academicYear, (query) => {
        query.where('academic_year_id', academicYear)
      })
      .select(columns ? columns : ['*'])
      .paginate((page||1), (limit||1))

      return {modules, 
        test: limit}
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
  async update(data: any, id: number): Promise<any> {
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