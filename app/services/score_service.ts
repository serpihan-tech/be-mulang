import db from "@adonisjs/lucid/services/db";
import Score from "#models/score";

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
      .select(columns ? columns : ['*'])
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

  async massUpdate(data: any,): Promise<any> {
    await Score.updateOrCreate(
      {
        class_student_id: data.class_student_id,
        module_id: data.module_id,
        score_type_id: data.score_type_id,
        description: data.description
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