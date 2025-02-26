import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import ClassStudent from './class_student.js'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import Module from './module.js'

export default class Semester extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasOne(() => ClassStudent, { foreignKey: 'semester_id' })
  declare classStudent: HasOne<typeof ClassStudent>

  @hasMany(() => Module, { foreignKey: 'semester_id' })
  declare modules: HasMany<typeof Module>
}
