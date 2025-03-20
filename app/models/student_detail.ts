import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Student from './student.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class StudentDetail extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare studentId: number

  @column()
  declare religion: string

  @column()
  declare gender: string

  @column()
  declare address: string | null

  @column()
  declare parentsName: string | null

  @column()
  declare parentsPhone: string | null

  @column()
  declare parentsJob: string | null

  @column()
  declare studentsPhone: string | null

  @column()
  declare nis: string

  @column()
  declare nisn: string

  @column()
  declare birthDate: Date

  @column()
  declare birthPlace: string

  @column()
  declare enrollmentYear: Date

  @column()
  declare profilePicture: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>
}
