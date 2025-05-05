import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createRoomValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(100),
  })
)

export const updateRoomValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(100).optional(),
  })
)

const fields = {
  name: 'Nama Ruangan',
}

createRoomValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateRoomValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
