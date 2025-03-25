import { DateTime } from 'luxon'
import {
  BaseModel,
  belongsTo,
  column,
  hasOne,
  beforeFetch,
  beforeFind,
  hasMany,
} from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
import ModelFilter from '../utils/filter_query.js'
// import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Class extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare teacherId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @hasMany(() => ClassStudent, { foreignKey: 'classId' })
  declare classStudent: HasMany<typeof ClassStudent>

  // @beforeFind()
  // static async addRelations(query: ModelQueryBuilderContract<typeof Class>) {
  //   query.preload('teacher')
  // }

  // @beforeFetch()
  // static async addRelationsIndex(query: ModelQueryBuilderContract<typeof Class>) {
  //   query.preload('teacher')
  // }

  public static whiteList: string[] = ['name', 'teacherId']
  public static blackList: string[] = ['limit', 'page', 'nip', 'tahunAjar', 'sortBy', 'sortOrder']

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  }
}
