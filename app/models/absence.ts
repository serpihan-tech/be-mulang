import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

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
  declare module_id: number

  @column()
  declare status: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}