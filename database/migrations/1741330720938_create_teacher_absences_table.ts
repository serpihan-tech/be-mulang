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
      table.date('date')
      table.enum('status', ['Hadir', 'Izin', 'Sakit', 'Alfa']).notNullable()
      table.time('check_in_time')
      table.time('check_out_time')
      table.text('in_photo').nullable()
      table.text('out_photo').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
