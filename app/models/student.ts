import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import StudentDetail from './student_detail.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import ClassStudent from './class_student.js'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare name: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @hasOne(() => StudentDetail, { foreignKey: 'student_id' })
  declare studentDetail: HasOne<typeof StudentDetail>

  @hasOne(() => ClassStudent, { foreignKey: 'student_id' })
  declare classStudent: HasOne<typeof ClassStudent>
}
