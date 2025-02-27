import { ModuleFactory } from '#database/factories/module_factory'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await ModuleFactory.createMany(18)
  }
}
