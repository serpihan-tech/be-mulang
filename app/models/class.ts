import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'

export default class Class extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare teacher_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Teacher, { foreignKey: 'teacher_id' })
  declare teacher: BelongsTo<typeof Teacher>

  @hasOne(() => ClassStudent, { foreignKey: 'class_id' })
  declare classStudent: HasOne<typeof ClassStudent>
}
