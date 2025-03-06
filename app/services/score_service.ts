import db from "@adonisjs/lucid/services/db";
import ScoreContract from "../contracts/score_contract.js";
import Score from "#models/score";

export default class ScoreService implements ScoreContract {
  async get(columns?: string[], id?: number): Promise<any> {
    try {
      if (id) {
        const scores = await db.from('scores').where('id', id).select(columns? columns : ['*'])
        return scores
      }

      const scores = await db.from('scores').select(columns? columns : ['*'])
      return scores

    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }
  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const scores = await Score.create(data, { client: trx })
      await trx.commit()
      return scores
    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }
  async update(data: any, id: any): Promise<any> {
    try {
      
    } catch (error) {
      throw new Error('Method not implemented.');
    }
  }
  async delete(id: number): Promise<any> {
    try {
        
    } catch (error) {
      
    }
    throw new Error('Method not implemented.');
  }
}