import type { BaseModel } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

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
    model: T,
    queryParams: Record<string, any>,
    likeFields: string[] = []
  ): ModelQueryBuilderContract<T> {
    let query = model.query()

    Object.entries(queryParams).forEach(([key, value]) => {
      if (!value) return

      if (value === 'false') value = 0
      if (value === 'true') value = 1

      switch (true) {
        case typeof value === 'string' && likeFields.includes(key):
          query.where(key, 'LIKE', `%${value}%`)
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

        case typeof value === 'string' && value.includes('%'):
          query.where(key, 'LIKE', value)
          break

        case Array.isArray(value):
          query.whereIn(key, value)
          break

        default:
          query.where(key, value)
          break
      }
    })

    return query
  }
}
