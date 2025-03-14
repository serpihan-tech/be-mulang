import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Module from './module.js'
import ClassStudent from './class_student.js'
import ScoreType from './score_type.js'
import ModelFilter from '../utils/filter_query.js'

export default class Score extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare score: number

  @column()
  declare classStudentId: number

  @column()
  declare moduleId: number

  @column()
  declare scoreTypeId: number

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassStudent, { foreignKey: 'classStudentId' })
  declare classStudent: BelongsTo<typeof ClassStudent>

  @belongsTo(() => Module, { foreignKey: 'moduleId' })
  declare module: BelongsTo<typeof Module>

  @belongsTo(() => ScoreType, { foreignKey: 'scoreTypeId' })
  declare scoreType: BelongsTo<typeof ScoreType>

  public static whiteList: string[] = ['description']

  public static blackList: string[] = ['limit', 'page']

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  }
}
