import db from '@adonisjs/lucid/services/db'
import Score from '#models/score'

export default class ScoreService {
  async getAll(params: any, page?: number, limit?: number): Promise<any> {
    const scores = await Score.filter(params).paginate(page ?? 1, limit)
    return scores
  }

  async getOne(id: number): Promise<any> {
    const scores = await Score.query().where('id', id).firstOrFail()
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

  async massUpdate(data: any): Promise<any> {
    await Score.updateOrCreate(
      {
        class_student_id: data.class_student_id,
        module_id: data.module_id,
        score_type_id: data.score_type_id,
        description: data.description,
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
