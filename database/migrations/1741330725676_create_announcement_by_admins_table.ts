import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'announcement_by_admins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('content').notNullable()
      table.integer('admin_id').unsigned().references('id').inTable('admins').onDelete('CASCADE')
      table.date('date').notNullable()
      table.string('target_roles').notNullable()
      table.text('files').nullable()
      table.enum('category', [
        'Akademik',
        'Administrasi',
        'Kegiatan Sekolah',
        'Fasilitas',
        'Prestasi',
        'Informasi Umum',
      ])
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
