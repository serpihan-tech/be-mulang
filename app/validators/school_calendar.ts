import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createCalendarValidator = vine.compile(
  vine.object({
    date_start: vine.date().optional().requiredIfExists('date_end'),
    date_end: vine.date().optional(),
    description: vine.string().maxLength(100),
  })
)

export const updateCalendarValidator = vine.compile(
  vine.object({
    date_start: vine.date().optional().requiredIfExists('date_end'),
    date_end: vine.date().optional(),
    description: vine.string().maxLength(100).optional(),
  })
)

const fields = {
  date_start: 'Tanggal Mulai',
  date_end: 'Tanggal Akhir',
  description: 'Deskripsi',
}

createCalendarValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateCalendarValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
