import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('username').nullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.smallint('otp').nullable()
      table.timestamp('otp_created_at').nullable()
      table.string('reset_token').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
