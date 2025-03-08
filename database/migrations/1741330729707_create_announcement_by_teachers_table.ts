import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcement_by_teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('teacher_id')
        .unsigned()
        .references('id')
        .inTable('teachers')
        .onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('content').notNullable()
      table
        .integer('schedule_id')
        .unsigned()
        .references('id')
        .inTable('schedules')
        .onDelete('CASCADE')
      table.date('date').notNullable()
      table.text('files').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
