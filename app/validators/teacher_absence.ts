import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createTeacherAbsenceValidator = vine.compile(
  vine.object({
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }),
    date: vine.date(),
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']),
    check_in_time: vine
      .date({ formats: ['HH:mm:ss'] })
      .optional()
      .requiredIfExists('check_out_time')
      .requiredWhen('status', '=', 'Hadir'),
    check_out_time: vine
      .date({ formats: ['HH:mm:ss'] })
      .optional()
      // .requiredWhen('status', '=', 'Hadir')
      .nullable(),
    in_photo: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional()
      .requiredWhen('status', '=', 'Hadir'),
    out_photo: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional()
      .nullable(),
  })
)

export const updateTeacherAbsenceValidator = vine.compile(
  vine.object({
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }).optional(),
    date: vine.date().optional(),
    status: vine.enum(['Hadir', 'Izin', 'Sakit', 'Alfa']).optional(),
    check_in_time: vine
      .date({ formats: ['HH:mm:ss'] })
      .optional()
      .requiredIfExists('check_out_time')
      .requiredWhen('status', '=', 'Hadir'),
    check_out_time: vine.date({ formats: ['HH:mm:ss'] }).optional(),
    in_photo: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional()
      // .requiredWhen('status', '=', 'Hadir')
      .nullable(),
    out_photo: vine
      .file({
        size: '5mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional()
      .nullable(),
  })
)

const fields = {
  teacher_id: 'ID Guru',
  date: 'Tanggal',
  status: 'Status',
  check_in: 'Jam Masuk',
  check_out: 'Jam Pulang / Keluar',
}

createTeacherAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateTeacherAbsenceValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
