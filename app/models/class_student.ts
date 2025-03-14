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
  declare classId: number

  @column()
  declare studentId: number

  @column()
  declare academicYearId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Student, { foreignKey: 'studentId' })
  declare student: BelongsTo<typeof Student>

  @belongsTo(() => AcademicYear, { foreignKey: 'academicYearId' })
  declare academicYear: BelongsTo<typeof AcademicYear>

  @hasMany(() => Absence, { foreignKey: 'classStudentId' })
  declare absences: HasMany<typeof Absence>

  @hasMany(() => Score, { foreignKey: 'classStudentId' })
  declare scores: HasMany<typeof Score>
}
