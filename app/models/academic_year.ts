import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import Module from '#models/module'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ClassStudent from './class_student.js'
import ModelFilter from '../utils/filter_query.js'

export default class AcademicYear extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare dateStart: Date

  @column()
  declare dateEnd: Date

  @column()
  declare semester: string

  @column()
  declare status: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Module, { foreignKey: 'academicYearId' })
  declare modules: HasMany<typeof Module>

  @hasMany(() => ClassStudent, { foreignKey: 'academicYearId' })
  declare classStudents: HasMany<typeof ClassStudent>

  // ! I dont think we need this (cause the params in Indonesia Lang, not English like in DB Coloumns), but just in case

  // /**
  //  * Jika butuh filter seperti %LIKE%
  //  */
  // public static whiteList = ['name']

  // public static blackList = ['page', 'limit']

  // /**
  //  * Metode untuk apply filter langsung di model
  //  *
  //  * @example
  //  * // GET /api/academic-years?semester=ganjil&status=true
  //  * const academicYears = await AcademicYear.filter(request.all())
  //  *
  //  * @param queryParams - Parameter yang masuk di request
  //  * @returns AcademicYear
  //  */
  // public static filter(
  //   // model: T,
  //   // query: ModelQueryBuilderContract<T, InstanceType<T>>,
  //   // query: typeof BaseModel,
  //   queryParams: Record<string, any>
  // ): any {
  //   return ModelFilter.apply(this, queryParams, this.whiteList, this.blackList)
  // }
}
