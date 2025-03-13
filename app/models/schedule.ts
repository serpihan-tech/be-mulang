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

  @column({ serializeAs: null })
  declare start_time: string

  @column({ serializeAs: null })
  declare end_time: string

  @column()
  declare module_id: number

  @column()
  declare days: Days

  @column()
  declare class_id: number

  @column()
  declare room_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Module, { foreignKey: 'module_id' })
  declare module: BelongsTo<typeof Module>

  @belongsTo(() => Class, { foreignKey: 'class_id' })
  declare class: BelongsTo<typeof Class>

  @belongsTo(() => Room, { foreignKey: 'room_id' })
  declare room: BelongsTo<typeof Room>

  @hasMany(() => Absence, { foreignKey: 'schedule_id' })
  declare absences: HasMany<typeof Absence>

  @hasMany(() => AnnouncementByTeacher, { foreignKey: 'schedule_id' })
  declare announcements: HasMany<typeof AnnouncementByTeacher>

  public serializeExtras() {
    return {
      start_time: DateTime.fromFormat(this.start_time, 'HH:mm:ss').toFormat('HH:mm:ss'),
      end_time: DateTime.fromFormat(this.end_time, 'HH:mm:ss').toFormat('HH:mm:ss'),
    }
  }

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams)
  }
}
