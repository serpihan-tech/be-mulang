import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAbsenceValidator = vine.compile(
  vine.object({
    schedule_id: vine.number().exists({ table: 'schedules', column: 'id' }),
    class_student_id: vine.number().exists({ table: 'students', column: 'id' }),
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
    reason: vine.string().maxLength(150).optional().requiredWhen('status', '=', 'Izin'),
    date: vine.date(),
  })
)

export const updateAbsenceValidator = vine.compile(
  vine.object({
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
    reason: vine.string().maxLength(150).optional().requiredWhen('status', '=', 'Izin'),
  })
)

export const massCreateAbsencesValidator = vine.compile(
  vine.object({
    date: vine.date(),
    scheduleId: vine.number().exists({ table: 'schedules', column: 'id' }),
    absences: vine.array(
      vine.object({
        classStudentId: vine.number().exists({ table: 'class_students', column: 'id' }),
        status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
        reason: vine
          .string()
          .maxLength(150)
          .nullable()
          .optional()
          .requiredWhen('status', '=', 'Izin'),
      })
    ),
  })
)

const fields = {
  scheduleId: 'ID Jadwal',
  schedule_id: 'ID Jadwal',
  classStudentId: 'ID Siswa',
  class_student_id: 'ID Siswa',
  status: 'Status',
  reason: 'Alasan',
  date: 'Tanggal',
}

createAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
massCreateAbsencesValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
