import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne, beforeFetch, beforeFind } from '@adonisjs/lucid/orm'
import Teacher from './teacher.js'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
// import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

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

  // @beforeFind()
  // static async addRelations(query: ModelQueryBuilderContract<typeof Class>) {
  //   query.preload('teacher')
  // }

  // @beforeFetch()
  // static async addRelationsIndex(query: ModelQueryBuilderContract<typeof Class>) {
  //   query.preload('teacher')
  // }
}
