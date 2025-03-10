import ScoreType from '#models/score_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ScoreType.createMany([
      {
        name: 'Tugas / Ulangan Harian',
        weight: 35,
      },
      {
        name: 'UTS',
        weight: 25,
      },
      {
        name: 'UAS',
        weight: 40,
      },
    ])
  }
}
