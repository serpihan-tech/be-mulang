import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'scores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('class_student_id')
        .unsigned()
        .references('id')
        .inTable('class_students')
        .onDelete('CASCADE')
      table.integer('module_id').unsigned().references('id').inTable('modules').onDelete('CASCADE')
      table
        .integer('score_type_id')
        .unsigned()
        .references('id')
        .inTable('score_types')
        .onDelete('CASCADE')
      table.integer('score').notNullable()
      table.string('description').checkLength('<=', 100).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
