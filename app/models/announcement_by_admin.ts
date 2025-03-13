import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Admin from './admin.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ModelFilter from '../utils/filter_query.js'

export default class AnnouncementByAdmin extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare content: string

  @column()
  declare adminId: number // fk

  @column()
  declare files: string

  @column()
  declare category: string

  @column()
  declare date: Date

  @column()
  declare target_roles: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Admin, { foreignKey: 'adminId' })
  declare admin: BelongsTo<typeof Admin>

  public static whiteList: string[] = ['description']

  public static filter(queryParams: Record<string, any>) {
    return ModelFilter.apply(this, queryParams, this.whiteList)
  }
}
