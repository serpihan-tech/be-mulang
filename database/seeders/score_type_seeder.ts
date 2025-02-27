import ScoreType from '#models/score_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ScoreType.createMany([
      {
        name: 'Tugas / Ulangan Harian',
        weight: 30,
      },
      {
        name: 'UTS',
        weight: 30,
      },
      {
        name: 'UAS',
        weight: 40,
      },
    ])
  }
}
