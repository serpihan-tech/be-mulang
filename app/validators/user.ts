import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createUserValidator = vine.compile(
  vine.object({
    username: vine.string().unique({ table: 'users', column: 'username' }).minLength(5),
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(8),
  })
)

export const passwordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    username: vine.string().unique({ table: 'users', column: 'username' }).minLength(5).optional(),
    email: vine.string().email().unique({ table: 'users', column: 'email' }).optional(),
    password: vine.string().minLength(8).optional(),
  })
)

const fields = {
  username: 'username',
  email: 'email',
  password: 'password',
}
// createUserValidator.messagesProvider = new CustomMessagesProvider()
passwordValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
