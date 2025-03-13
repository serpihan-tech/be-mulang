import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import Schedule from './schedule.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class AnnouncementByTeacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teacherId: number

  @column()
  declare scheduleId: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare date: Date

  @column()
  declare files: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacher_id' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Schedule, { foreignKey: 'schedule_id' })
  declare schedule: BelongsTo<typeof Schedule>
}
