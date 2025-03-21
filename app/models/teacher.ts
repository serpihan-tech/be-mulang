import { BaseModel, column, belongsTo, hasOne, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import { DateTime } from 'luxon'
import Class from './class.js'
import Module from './module.js'
import AnnouncementByTeacher from './announcement_by_teacher.js'
import TeacherAbsence from './teacher_absence.js'

export default class Teacher extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

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
  declare profile_picture: string

  @column()
  declare birth_date: Date

  @column()
  declare birth_place: string

  @column()
  declare gender: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @hasOne(() => Class, { foreignKey: 'teacher_id' })
  declare class: HasOne<typeof Class>

  @hasMany(() => Module, { foreignKey: 'teacher_id' })
  declare modules: HasMany<typeof Module>

  @hasMany(() => AnnouncementByTeacher, { foreignKey: 'teacher_id' })
  declare announcements: HasMany<typeof AnnouncementByTeacher>

  @hasMany(() => TeacherAbsence, { foreignKey: 'teacher_id' })
  declare absences: HasMany<typeof TeacherAbsence>
}
