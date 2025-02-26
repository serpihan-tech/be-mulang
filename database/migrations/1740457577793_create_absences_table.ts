import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'absences'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('schedule_id').unsigned().references('id').inTable('schedules').onDelete('CASCADE')
      table.integer('class_student_id').unsigned().references('id').inTable('class_students').onDelete('CASCADE')
      table.string('reason').notNullable()
      table.boolean('status').notNullable()
      table.date('date').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}