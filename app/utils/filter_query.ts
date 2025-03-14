import type { BaseModel } from '@adonisjs/lucid/orm'
import type { ExtractScopes, ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class ModelFilter {
  /**
   * Apply query filter dari request query parameters
   *
   * @example
   * // GET /users?name=John&age=>=10
   * ModelFilter.apply(User, request.qs(), ['name'])
   *
   * @param {typeof BaseModel} model
   * @param {Record<string, any>} queryParams
   * @param {string[]} likeFields
   * @returns {ModelQueryBuilderContract<T>}
   */
  public static apply<T extends typeof BaseModel>(
    // model: T,
    query: ModelQueryBuilderContract<T, InstanceType<T>>,
    queryParams: Record<string, any>,
    likeFields: string[] = [],
    blackList: string[] = ['page', 'limit'] // query param yang tidak diolah oleh filter
  ): ModelQueryBuilderContract<T, any> {
    // let query = model.query()

    let sortBy = 'id' // Default sorting column
    let sortOrder: 'asc' | 'desc' = 'asc' // Default sorting order

    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return

      if (blackList.includes(key)) return

      if (value === 'false') value = 0
      if (value === 'true') value = 1

      switch (true) {
        case key === 'sortBy':
          sortBy = value
          break

        case key === 'sortOrder':
          sortOrder = value.toLowerCase() === 'desc' ? 'desc' : 'asc'
          break

        case typeof value === 'string' && likeFields.includes(key):
          query.where(key, 'LIKE', `%${value.replace(/['+(']/g, '').trim()}%`) // + symbol trim
          break

        case typeof value === 'string' && value.startsWith('>='):
          query.where(key, '>=', value.replace('>=', '').trim())
          break

        case typeof value === 'string' && value.startsWith('<='):
          query.where(key, '<=', value.replace('<=', '').trim())
          break

        case typeof value === 'string' && value.startsWith('>'):
          query.where(key, '>', value.replace('>', '').trim())
          break

        case typeof value === 'string' && value.startsWith('<'):
          query.where(key, '<', value.replace('<', '').trim())
          break

        case Array.isArray(value):
          query.whereIn(key, value)
          break

        default:
          query.where(key, value)
          break
      }
    })

    query.orderBy(sortBy, sortOrder) // Apply sorting

    return query
  }
}
