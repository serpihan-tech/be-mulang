import db from "@adonisjs/lucid/services/db";
import ScoreContract from "../contracts/score_contract.js";
import Score from "#models/score";
import { error } from "node:console";
import score_seeder from "#database/seeders/score_seeder";

export default class ScoreService {
  async get(columns?: string[], page?: number, limit?: number): Promise<any> {
    try {
      const scores = await Score.query().select(columns ? columns : ['*']).paginate((page ?? 1), limit)
      return scores

    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }
  async getByFilter(columns?: string[], filter?: any, page?: number, limit?: number): Promise<any> {
    const { moduleId = "", classStudentId = "", scoreTypeId = "" } = filter

    const scores = await Score.query()
      .if(moduleId, (query) => {
        query.where('moduleId', moduleId).firstOrFail()
      })
      .if(classStudentId, (query) => {
        query.where('class_student_id', classStudentId).firstOrFail()
      })
      .if(scoreTypeId, (query) => {
        query.where('score_type_id', scoreTypeId).firstOrFail()
      })
      .select(['*'])
      .paginate((page ?? 1), limit)

    return scores
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
  async delete(id: number): Promise<any> {
    const score = await Score.query().where('id', id).firstOrFail()
    return await score.delete()
  }
}