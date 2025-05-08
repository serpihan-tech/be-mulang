import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAcademicYearValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100),
    date_start: vine.date(),
    date_end: vine.date().afterField('date_start'),
    semester: vine.enum(['ganjil', 'genap']),
    status: vine.boolean(),
  })
)

export const updateAcademicYearValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(3).maxLength(100).optional(),
    date_start: vine.date().optional(),
    date_end: vine.date().afterField('date_start').optional(),
    semester: vine.enum(['ganjil', 'genap']).optional(),
    status: vine.boolean().optional(),
  })
)

const field = {
  name: 'Nama Tahun Ajaran',
  date_start: 'Tanggal Mulai',
  date_end: 'Tanggal Akhir',
  academic_year: 'AcademicYear',
  status: 'Status',
}

createAcademicYearValidator.messagesProvider = new SimpleMessagesProvider(messages, field)
updateAcademicYearValidator.messagesProvider = new SimpleMessagesProvider(messages, field)
