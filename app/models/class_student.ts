import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import AcademicYear from './academic_year.js'
import Student from './student.js'
import Class from './class.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Score from './score.js'
import Absence from './absence.js'

export default class ClassStudent extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare class_id: number

  @column()
  declare student_id: number

  @column()
  declare academic_year_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Class, { foreignKey: 'class_id' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Student, { foreignKey: 'student_id' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => AcademicYear, { foreignKey: 'academic_year_id' })
  declare academicYear: BelongsTo<typeof AcademicYear>

  @hasMany(() => Absence, { foreignKey: 'class_student_id' })
  declare absences: HasMany<typeof Absence>

  @hasMany(() => Score, { foreignKey: 'class_student_id' })
  declare scores: HasMany<typeof Score>
}
