import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import Score from './score.js'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import AcademicYear from './academic_year.js'
import Teacher from './teacher.js'
import ModelFilter from '../utils/filter_query.js'

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

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => AcademicYear, { foreignKey: 'academicYearId' })
  declare academicYear: BelongsTo<typeof AcademicYear>

  @hasMany(() => Score, { foreignKey: 'moduleId' })
  declare scores: HasMany<typeof Score>

  public static whiteList: string[] = ['name']
  public static blackList: string[] = ['limit', 'page', 'nip', 'tahunAjar']

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  }
}
