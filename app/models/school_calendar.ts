import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class SchoolCalendar extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare date_start: Date

  @column()
  declare date_end: Date

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
