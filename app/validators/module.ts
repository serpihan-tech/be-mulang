import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createModuleValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(60),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }),
    academic_year_id: vine.number().exists({ table: 'academic_years', column: 'id' }),
  })
)

export const updateModuleValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3).maxLength(60).optional(),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }).optional(),
    academic_year_id: vine.number().exists({ table: 'academic_years', column: 'id' }).optional(),
  })
)

export const filterModuleValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
    teacherNip: vine.string().exists({ table: 'teachers', column: 'nip' }).optional(),
    academicYear: vine.string().exists({ table: 'academic_years', column: 'name' }).optional(),
  })
)

const fields = {
  name: 'Nama Mapel',
  teacher_id: 'ID Guru',
  academic_year_id: 'ID Tahun Ajaran',
}

createModuleValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateModuleValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
filterModuleValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
