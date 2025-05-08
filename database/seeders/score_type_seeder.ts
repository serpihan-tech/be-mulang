import ScoreType from '#models/score_type'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ScoreType.createMany([
      {
        name: 'Tugas / Ulangan Harian',
        weight: 35,
        taskQuota: 4,
      },
      {
        name: 'UTS',
        weight: 25,
        taskQuota: 1,
      },
      {
        name: 'UAS',
        weight: 40,
        taskQuota: 1,
      },
    ])
  }
}
