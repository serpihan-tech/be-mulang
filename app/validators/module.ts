import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createModuleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    class_id: vine.number().exists({ table: 'classes', column: 'id' }),
  })
)

export const updateModuleValidator = vine.compile(
  vine.object({
    name: vine.string(),
    class_id: vine.number().exists({ table: 'classes', column: 'id' }),
  })
)