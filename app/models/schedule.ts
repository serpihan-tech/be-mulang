import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { EnumType } from 'typescript'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Module from './module.js'
import Absence from './absence.js'
import Class from './class.js'
import Room from './room.js'

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare start_time: DateTime

  @column()
  declare end_time: DateTime

  @column()
  declare module_id: number

  @column()
  declare day: EnumType

  @column()
  declare class_id: number

  @column()
  declare room_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Module, { foreignKey: 'module_id' })
  declare module: BelongsTo<typeof Module>

  @belongsTo(() => Class, { foreignKey: 'class_id' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Room, { foreignKey: 'room_id' })
  declare room: BelongsTo<typeof Room>

  @hasMany(() => Absence, { foreignKey: 'schedule_id' })
  declare absences: HasMany<typeof Absence>
}
