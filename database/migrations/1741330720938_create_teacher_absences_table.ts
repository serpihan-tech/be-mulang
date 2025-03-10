import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teacher_absences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('teacher_id')
        .unsigned()
        .references('id')
        .inTable('teachers')
        .onDelete('CASCADE')
      table.string('date')
      table.time('check_in_time')
      table.time('check_out_time')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
