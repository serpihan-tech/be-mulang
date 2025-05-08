import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAdminValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    phone: vine.string().minLength(8).maxLength(15),
    address: vine.string().maxLength(255),
    profile_picture: vine
      .file({
        size: '2 MB',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
  })
)

export const updateAdminValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255).optional(),
    user_id: vine.number().exists({ table: 'users', column: 'id' }).optional(),
    phone: vine.string().minLength(8).maxLength(15).optional(),
    address: vine.string().maxLength(255).optional(),
    profile_picture: vine
      .file({
        size: '2 MB',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
  })
)

const field = {
  name: 'Nama Admin',
  phone: 'Nomor Telepon',
  address: 'Alamat',
  profile_picture: 'Foto Profil',
}

createAdminValidator.messagesProvider = new SimpleMessagesProvider(messages, field)
updateAdminValidator.messagesProvider = new SimpleMessagesProvider(messages, field)
