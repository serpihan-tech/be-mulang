import { ScoreFactory } from '#database/factories/score_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ScoreFactory.createMany(60)
  }
}
