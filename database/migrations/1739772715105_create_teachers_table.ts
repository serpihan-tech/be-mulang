import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'teachers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('nip').notNullable().unique()
      table.string('phone').notNullable()
      table
        .enum('religion', ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'])
        .notNullable()
      table.string('birth_date').nullable()
      table.string('birth_place').nullable()
      table.string('address').nullable()
      table.enum('gender', ['Laki-Laki', 'Perempuan']).notNullable()
      table.string('profile_picture').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
