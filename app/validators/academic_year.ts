import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/message_validation.js'

export const createRecordValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(255),
    date_start: vine.date(),
    date_end: vine.date().afterField('date_start'),
    semester: vine.enum(['ganjil', 'genap']),
    status: vine.boolean(),
  })
)

const field = {
  name: 'Nama Tahun Ajaran',
  date_start: 'Tanggal Mulai',
  date_end: 'Tanggal Akhir',
  semester: 'Semester',
  status: 'Status',
}

createRecordValidator.messagesProvider = new SimpleMessagesProvider(messages, field)