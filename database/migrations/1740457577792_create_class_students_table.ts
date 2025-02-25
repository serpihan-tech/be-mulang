import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'class_students'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('class_id').unsigned().references('id').inTable('classes').onDelete('CASCADE')
      table.integer('student_id').unsigned().references('id').inTable('students').onDelete('CASCADE')
      table.integer('semester_id').unsigned().references('id').inTable('semesters').onDelete('CASCADE')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}