import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Score from './score.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Semester from './semester.js'
import Teacher from './teacher.js'

export default class Module extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare teacher_id: number

  @column()
  declare semester_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacher_id' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Semester, { foreignKey: 'semster_id' })
  declare semster: BelongsTo<typeof Semester>

  @hasMany(() => Score, { foreignKey: 'module_id' })
  declare scores: HasMany<typeof Score>
}
