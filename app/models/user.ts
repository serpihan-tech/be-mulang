import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasOne, manyToMany } from '@adonisjs/lucid/orm'
import type { HasOne, ManyToMany } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { AccessToken } from '@adonisjs/auth/access_tokens'
import Role from '#models/role'
import Teacher from './teacher.js'
import Admin from './admin.js'
import Student from './student.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email', 'username'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

  /**
   * TODO : SerializeAs: null if want the email to be hidden in response body
   * if want to show the email in response body, remove the serializeAs: null
   * or directly return the email on the response body
   * e.g. return { user.email }
   */
  @column({})
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column({ serializeAs: null })
  declare otp: number | null

  @column.dateTime({})
  declare otp_created_at: DateTime | null

  @column({ serializeAs: null })
  declare reset_token: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => Teacher, { foreignKey: 'userId' }) declare teacher: HasOne<typeof Teacher>

  @hasOne(() => Admin, { foreignKey: 'userId' }) declare admin: HasOne<typeof Admin>

  @hasOne(() => Student, { foreignKey: 'userId' }) declare student: HasOne<typeof Student>

  @manyToMany(() => Role, {
    pivotTable: 'user_has_roles',
    pivotForeignKey: 'user_id',
    pivotRelatedForeignKey: 'role_id',
  })
  declare roles: ManyToMany<typeof Role>

  currentAccessToken?: AccessToken

  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '14 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  static async getRole(user: User) {
    const roles = await user.related('roles').query().firstOrFail()

    // semisal 1 user bisa memiliki lebih dari 1 role
    // const roles = await user.related('roles').query()

    // if (roles.length === 1) {
    //   return roles[0]
    // }
    return roles
  }

  static async assignRole(user: User, role: string) {
    const roleData = await Role.findBy('role', role)

    if (!roleData) {
      throw new Error(`Role "${role}" Tidak Ditemukan!`)
    }

    await user.related('roles').attach([roleData.id])
  }
}
