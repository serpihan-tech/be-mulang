import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class TeacherAbsence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teacherId: number

  @column()
  declare date: Date

  @column({ serializeAs: null })
  declare checkInTime: string

  @column({ serializeAs: null })
  declare checkOutTime: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>
}
