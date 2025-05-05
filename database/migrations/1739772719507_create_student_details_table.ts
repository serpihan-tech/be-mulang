import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'student_details'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('student_id')
        .unsigned()
        .references('id')
        .inTable('students')
        .onDelete('CASCADE')
      table.string('address').nullable()
      table.string('parents_name').nullable()
      table.string('parents_phone').nullable()
      table.string('parents_job').nullable()
      table.string('students_phone').nullable()
      table.string('nis').notNullable().unique()
      table.string('nisn').notNullable().unique()
      table.enum('gender', ['Laki-laki', 'Perempuan']).notNullable()
      table
        .enum('religion', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'])
        .notNullable()
      table.date('birth_date').notNullable()
      table.string('birth_place').notNullable()
      table.date('enrollment_year').notNullable()
      table.string('profile_picture').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
