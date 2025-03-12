import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Module from './module.js'
import ClassStudent from './class_student.js'
import ScoreType from './score_type.js'
import ModelFilter from '../utils/filter_query.js'

type FilterProps = {
  model?: typeof BaseModel
  queryParams?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  whiteList?: string[]
}

export default class Score extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare score: number

  @column()
  declare class_student_id: number

  @column()
  declare module_id: number

  @column()
  declare score_type_id: number

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassStudent, { foreignKey: 'class_student_id' })
  declare classStudent: BelongsTo<typeof ClassStudent>

  @belongsTo(() => Module, { foreignKey: 'module_id' })
  declare module: BelongsTo<typeof Module>

  @belongsTo(() => ScoreType, { foreignKey: 'score_type_id' })
  declare scoreType: BelongsTo<typeof ScoreType>

  public static whiteList: string[] = ['description']

  public static filter(queryParams = {}): FilterProps {
    return ModelFilter.apply(this, queryParams, this.whiteList)
  }
}
