import vine from '@vinejs/vine'
import { FieldContext, MessagesProviderContact } from '@vinejs/vine/types'

export class CustomMessagesProvider implements MessagesProviderContact {
  getMessage(
    defaultMessage: string,
    rule: string,
    field: FieldContext,
    meta?: Record<string, any>
  ) {
    const messages: Record<string, string> = {
      'password.minLength': 'Password minimal harus 8 karakter!',
      'email.email': 'Format email tidak valid!',
    }

    return messages[`${field.name}.${rule}`] || defaultMessage
  }
}

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

// createUserValidator.messagesProvider = new CustomMessagesProvider()
passwordValidator.messagesProvider = new CustomMessagesProvider()
