import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createScheduleValidator = vine.compile(
  vine.object({
    class_id: vine.number().exists({ table: 'classes', column: 'id' }),
    room_id: vine.number().exists({ table: 'rooms', column: 'id' }),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }),
    days: vine.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']),
    start_time: vine.date({ formats: ['HH:mm:ss'] }),
    end_time: vine.date({ formats: ['HH:mm:ss'] }),
  })
)

export const updateScheduleValidator = vine.compile(
  vine.object({
    class_id: vine.number().exists({ table: 'classes', column: 'id' }).optional(),
    room_id: vine.number().exists({ table: 'rooms', column: 'id' }).optional(),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }).optional(),
    days: vine.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']).optional(),
    start_time: vine.date({ formats: ['HH:mm:ss'] }).optional(),
    end_time: vine.date({ formats: ['HH:mm:ss'] }).optional(),
  })
)

const fields = {
  class_id: 'ID Kelas',
  teacher_id: 'ID Guru',
  subject_id: 'ID Mata Pelajaran',
  date: 'Tanggal',
  start_time: 'Waktu Mulai',
}

createScheduleValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateScheduleValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
