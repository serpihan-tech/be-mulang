import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
import Schedule from './schedule.js'

export default class Absence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reason: string

  @column()
  declare date: DateTime

  @column()
  declare class_student_id: number

  @column()
  declare schedule_id: number

  @column()
  declare status: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassStudent, { foreignKey: 'class_student_id' })
  declare classStudent: BelongsTo<typeof ClassStudent>

  @belongsTo(() => Schedule, { foreignKey: 'schedule_id' })
  declare schedule: BelongsTo<typeof Schedule>
}
