import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Score from './score.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AcademicYear from './academic_year.js'
import Teacher from './teacher.js'

export default class Module extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare teacherId: number

  @column()
  declare academicYearId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacher_id' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => AcademicYear, { foreignKey: 'academic_year_id' })
  declare academicYear: BelongsTo<typeof AcademicYear>

  @hasMany(() => Score, { foreignKey: 'module_id' })
  declare scores: HasMany<typeof Score>
}
