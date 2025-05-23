import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import Schedule from './schedule.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ModelFilter from '../utils/filter_query.js'
import Class from './class.js'
import Module from './module.js'

export default class AnnouncementByTeacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare teacherId: number

  // @column()
  // declare scheduleId: number

  @column()
  declare classId: number

  @column()
  declare moduleId: number

  @column()
  declare title: string

  @column()
  declare category: string

  @column()
  declare content: string

  @column()
  declare date: Date

  @column()
  declare files: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacherId' })
  declare teacher: BelongsTo<typeof Teacher>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Module, { foreignKey: 'moduleId' })
  declare module: BelongsTo<typeof Module>

  public static whiteList: string[] = ['title', 'content', 'date']
  public static blackList: string[] = [
    'limit',
    'page',
    'sortBy',
    'sortOrder',
    'search',
    'namaPengirim',
    'namaKelas',
  ]

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams)
  }
}
