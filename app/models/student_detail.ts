import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Student from './student.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class StudentDetail extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare student_id: number

  @column()
  declare gender: string

  @column()
  declare address: string | null

  @column()
  declare parents_name: string | null

  @column()
  declare parents_phone: string | null

  @column()
  declare parents_job: string | null

  @column()
  declare students_phone: string | null

  @column()
  declare nis: string

  @column()
  declare nisn: string

  @column()
  declare enrollment_year: Date

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'student_id' })
  declare student: BelongsTo<typeof Student>
}
