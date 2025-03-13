import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { DateTime } from 'luxon'
import Class from './class.js'
import Module from './module.js'
import AnnouncementByTeacher from './announcement_by_teacher.js'
import TeacherAbsence from './teacher_absence.js'
import ModelFilter from '../utils/filter_query.js'

export default class Teacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare name: string

  @column()
  declare nip: string

  @column()
  declare phone: string | null

  @column()
  declare religion: string

  @column()
  declare address: string | null

  @column()
  declare profilePicture: string

  @column()
  declare birthDate: Date

  @column()
  declare birthPlace: string

  @column()
  declare gender: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'userId' })
  declare user: BelongsTo<typeof User>

  @hasOne(() => Class, { foreignKey: 'teacherId' })
  declare class: HasOne<typeof Class>

  @hasMany(() => Module, { foreignKey: 'teacherId' })
  declare modules: HasMany<typeof Module>

  @hasMany(() => AnnouncementByTeacher, { foreignKey: 'teacherId' })
  declare announcements: HasMany<typeof AnnouncementByTeacher>

  @hasMany(() => TeacherAbsence, { foreignKey: 'teacherId' })
  declare absences: HasMany<typeof TeacherAbsence>

  public static whiteList: string[] = []
  public static blackList: string[] = ['page', 'limit']

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  }
}
