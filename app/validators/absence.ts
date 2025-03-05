import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAbsenceValidator = vine.compile(
  vine.object({
    schedule_id: vine.number().exists({ table: 'schedules', column: 'id' }),
    class_student_id: vine.number().exists({ table: 'students', column: 'id' }),
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
    reason: vine.string().optional().requiredWhen('status', '=', 'Izin'),
    date: vine.date(),
  })
)

export const updateAbsenceValidator = vine.compile(
  vine.object({
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
    reason: vine.string().optional().requiredWhen('status', '=', 'Izin'),
  })
)

const fields = {
  schedule_id: 'ID Jadwal',
  class_student_id: 'ID Siswa',
  status: 'Status',
  reason: 'Alasan',
  date: 'Tanggal',
}

createAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
