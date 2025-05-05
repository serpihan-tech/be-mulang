import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
import Schedule from './schedule.js'
import ModelFilter from '../utils/filter_query.js'

export enum Status {
  HADIR = 'Hadir',
  IZIN = 'Izin',
  SAKIT = 'Sakit',
  ALFA = 'Alfa',
}

export default class Absence extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reason: string

  @column()
  declare date: Date | string

  @column({ columnName: 'class_student_id' })
  declare classStudentId: number

  @column({ columnName: 'schedule_id' })
  declare scheduleId: number

  @column()
  declare status: Status

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => ClassStudent, { foreignKey: 'classStudentId' })
  declare classStudent: BelongsTo<typeof ClassStudent>

  @belongsTo(() => Schedule, { foreignKey: 'scheduleId' })
  declare schedule: BelongsTo<typeof Schedule>

  public static blackList: string[] = ['nis', 'page', 'limit', 'search', 'sortBy', 'sortOrder']
  public static whiteList: string[] = ['date']

  public static filter<T extends typeof BaseModel>(
    // model: T,
    // query: ModelQueryBuilderContract<T, InstanceType<T>>,
    // query: typeof BaseModel,
    queryParams: Record<string, any>
  ): any {
    return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  }
}
