import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createStudentValidator = vine.compile(
  vine.object({
    name: vine.string(),
  })
)

export const createStudentDetailValidator = vine.compile(
  vine.object({
    address: vine.string(),
    parents_name: vine.string(),
    parents_phone: vine.string().minLength(11).maxLength(13),
    parents_job: vine.string(),
    students_phone: vine.string().minLength(11).maxLength(13),
    nis: vine.string(),
    nisn: vine.string(),
    gender: vine.enum(['laki-laki', 'perempuan']),
    religion: vine.enum(['Kristen', 'Katolik', 'Islam', 'Hindu', 'Budha', 'Konghucu']),
    birth_place: vine.string().optional(),
    birth_date: vine.date().optional().requiredIfExists('birth_place'),
    enrollment_year: vine.date(),
    profile_picture: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
  })
)

export const updateStudentValidator = vine.compile(
  vine.object({
    name: vine.string().optional(),
  })
)

export const updateStudentDetailValidator = vine.compile(
  vine.object({
    address: vine.string().optional(),
    parents_name: vine.string().optional(),
    parents_phone: vine.string().minLength(11).maxLength(13).optional(),
    parents_job: vine.string().optional(),
    students_phone: vine.string().minLength(11).maxLength(13).optional(),
    nis: vine.string().optional(),
    nisn: vine.string().optional(),
    gender: vine.enum(['laki-laki', 'perempuan']).optional(),
    religion: vine.enum(['Kristen', 'Katolik', 'Islam', 'Hindu', 'Budha', 'Konghucu']).optional(),
    birth_place: vine.string().optional(),
    birth_date: vine.date().optional().requiredIfExists('birth_place').optional(),
    enrollment_year: vine.date().optional(),
    profile_picture: vine
      .file({
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'],
      })
      .optional(),
  })
)

const fields = {
  parents_name: 'Nama Orang Tua / Wali',
  parents_phone: 'Nomor Telepon Orang Tua / Wali',
  parents_job: 'Pekerjaan Orang Tua / Wali',
  students_phone: 'Nomor Telepon Murid',
  enrollment_year: 'Tahun Masuk',
  gender: 'Jenis Kelamin',
  religion: 'Agama',
  phone: 'Nomor Telepon',
  birth_date: 'Tanggal Lahir',
  birth_place: 'Tempat Lahir',
  name: 'Nama Lengkap',
  nis: 'NIS',
  nisn: 'NISN',
  address: 'Alamat',
  profile_picture: 'Foto Profil',
}

createStudentValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
createStudentDetailValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateStudentValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateStudentDetailValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
