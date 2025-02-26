import { ClassFactory } from '#database/factories/class_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ClassFactory.createMany(8)
  }
}
