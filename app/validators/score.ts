import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createScoreValidator = vine.compile(
  vine.object({
    class_student_id: vine.number().exists({ table: 'students', column: 'id' }),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }).optional(),
    score: vine.number().min(0).max(100),
    score_type_id: vine.number().exists({ table: 'score_types', column: 'id' }),
    description: vine.string().maxLength(100).optional(),
  })
)

export const updateScoreValidator = vine.compile(
  vine.object({
    class_student_id: vine.number().exists({ table: 'students', column: 'id' }),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }).optional(),
    score: vine.number().min(0).max(100),
    score_type_id: vine.number().exists({ table: 'score_types', column: 'id' }),
    description: vine.string().maxLength(100).optional(),
  })
)

const fields = {
  id: 'ID Score Siswa',
  class_student_id: 'ID Siswa',
  module_id: 'ID Modul',
  score: 'Nilai',
  score_type_id: 'ID Tipe Nilai',
  description: 'Deskripsi',
}

createScoreValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateScoreValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)