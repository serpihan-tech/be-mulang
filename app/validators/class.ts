import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createClassValidator = vine.compile(
  vine.object({
    name: vine.string(),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }),
  })
)

export const updateClassValidator = vine.compile(
  vine.object({
    name: vine.string(),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }),
  })
)

const field = {
  name: 'Nama Kelas',
  teacher_id: 'ID Guru',
}

createClassValidator.messagesProvider = new SimpleMessagesProvider(messages, field)
updateClassValidator.messagesProvider = new SimpleMessagesProvider(messages, field)