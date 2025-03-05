import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Module from '#models/module'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'

export default class AcademicYear extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare date_start: Date

  @column()
  declare date_end: Date

  @column()
  declare semester: string

  @column()
  declare status: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Module, { foreignKey: 'academic_year_id' })
  declare modules: HasMany<typeof Module>

  @hasMany(() => ClassStudent, { foreignKey: 'academic_year_id' })
  declare classStudents: HasMany<typeof ClassStudent>
}
