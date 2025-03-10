import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class TeacherAbsence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teacher_id: number

  @column()
  declare date: Date

  @column({ serializeAs: null })
  declare check_in_time: string

  @column({ serializeAs: null })
  declare check_out_time: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacher_id' })
  declare teacher: BelongsTo<typeof Teacher>
}
