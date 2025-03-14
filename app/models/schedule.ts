import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Module from './module.js'
import Absence from './absence.js'
import Class from './class.js'
import Room from './room.js'
import AnnouncementByTeacher from './announcement_by_teacher.js'
import ModelFilter from '../utils/filter_query.js'

export enum Days {
  SENIN = 'Senin',
  SELASA = 'Selasa',
  RABU = 'Rabu',
  KAMIS = 'Kamis',
  JUMAT = 'Jumat',
  SABTU = 'Sabtu',
  MINGGU = 'Minggu',
}

export default class Schedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column()
  declare moduleId: number

  @column()
  declare days: Days

  @column()
  declare classId: number

  @column()
  declare roomId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Module, { foreignKey: 'moduleId' })
  declare module: BelongsTo<typeof Module>

  @belongsTo(() => Class, { foreignKey: 'classId' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Room, { foreignKey: 'roomId' })
  declare room: BelongsTo<typeof Room>

  @hasMany(() => Absence, { foreignKey: 'scheduleId' })
  declare absences: HasMany<typeof Absence>

  @hasMany(() => AnnouncementByTeacher, { foreignKey: 'scheduleId' })
  declare announcements: HasMany<typeof AnnouncementByTeacher>

  // public serializeExtras() {
  //   return {
  //     startTime: DateTime.fromFormat(this.startTime, 'HH:mm:ss').toFormat('HH:mm:ss'),
  //     endTime: DateTime.fromFormat(this.endTime, 'HH:mm:ss').toFormat('HH:mm:ss'),
  //   }
  // }

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams)
  }
}
