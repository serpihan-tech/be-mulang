import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_details'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('student_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('address').nullable()
      table.string('parents_name').nullable()
      table.string('parents_phone').nullable()
      table.string('parents_job').nullable()
      table.string('students_phone').nullable()
      table.string('nis').notNullable().unique()
      table.date('enrollment_year').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
