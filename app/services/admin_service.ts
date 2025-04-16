import Admin from '#models/admin'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'

export class AdminService {
  async getAll() {
    const admins = await Admin.query().preload('user', (query) =>
      query.select('id', 'username', 'email')
    )

    return admins
  }

  async getOne(id: number) {
    const admin = await Admin.query()
      .where('id', id)
      .preload('user', (query) => query.select('id', 'username', 'email'))
      .firstOrFail()

    return admin
  }

  async create(data: any) {
    const trx = await db.transaction()
    try {
      const user = await User.create(data.user, { client: trx })

      await User.assignRole(user, 'admin')

      const admin = await Admin.create({ userId: user.id, ...data.admin }, { client: trx })

      if (data.admin.profile_picture) {
        const profilePicture = data.admin.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/admins-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        admin.profilePicture = `admins-profile/${fileName}`
      }

      await admin.save()
      await trx.commit()

      return admin.load('user')
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(adminId: number, data: any) {
    const trx = await db.transaction()
    try {
      const admin = await Admin.query().where('id', adminId).firstOrFail()
      const user = await admin.related('user').query().firstOrFail()

      if (data.user) {
        await user.merge(data.user).save()
      }

      admin.merge(data.admin)
      if (data.admin.profile_picture) {
        const profilePicture = data.admin.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/admins-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        admin.profilePicture = `admins-profile/${fileName}`
      }

      await admin.save()
      await trx.commit()
      await admin.load('user')

      return admin
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number) {
    const admin = await Admin.query().where('id', id).firstOrFail()
    const user = await admin.related('user').query().firstOrFail()

    await user.delete()
  }
}
