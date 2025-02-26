import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare start_time: string

  @column()
  declare end_time: DateTime

  @column()
  declare module_id: number

  @column()
  declare date: DateTime

  @column()
  declare class_id: number

  @column()
  declare room_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}