import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
import Schedule from './schedule.js'

export enum Status {
  HADIR = 'Hadir',
  IZIN = 'Izin',
  SAKIT = 'Sakit',
  ALFA = 'Alfa',
}

export default class Absence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reason: string

  @column.dateTime()
  declare date: DateTime

  @column()
  declare classStudentId: number

  @column()
  declare scheduleId: number

  @column()
  declare status: Status

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassStudent, { foreignKey: 'classStudentId' })
  declare classStudent: BelongsTo<typeof ClassStudent>

  @belongsTo(() => Schedule, { foreignKey: 'scheduleId' })
  declare schedule: BelongsTo<typeof Schedule>
}
