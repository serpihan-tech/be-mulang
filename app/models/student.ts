import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne, beforeFind, hasMany } from '@adonisjs/lucid/orm'
import StudentDetail from './student_detail.js'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import ClassStudent from './class_student.js'
// import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Student extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare user_id: number

  @column()
  declare name: string

  @column()
  declare is_graduate: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @hasOne(() => StudentDetail, { foreignKey: 'student_id' })
  declare studentDetail: HasOne<typeof StudentDetail>

  @hasMany(() => ClassStudent, { foreignKey: 'student_id' })
  declare classStudent: HasMany<typeof ClassStudent>

  // @beforeFind()
  // static async addRelations(query: ModelQueryBuilderContract<typeof Student>) {
  //   query.preload('studentDetail')
  // }
}
