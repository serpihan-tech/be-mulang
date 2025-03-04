import vine, { SimpleMessagesProvider } from '@vinejs/vine'
// import { CustomAPIVineError } from '#start/validator'

export const createTeacherValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(4),
    nip: vine.string().minLength(4),
    phone: vine.string().minLength(11).maxLength(13),
    birth_place: vine.string().optional(),
    birth_date: vine.date().optional().requiredIfExists('birth_place'),
    gender: vine.enum(['pria', 'wanita']),
    religion: vine.enum(['Kristen', 'Katolik', 'Islam', 'Hindu', 'Budha', 'Konghucu']),
    address: vine.string().minLength(4),
    profile_picture: vine.string().minLength(4),
  })
)

export const updateTeacherValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(4).optional(),
    nip: vine.string().minLength(4).optional(),
    phone: vine.string().minLength(11).maxLength(13).optional(),
    birth_place: vine.string().optional(),
    birth_date: vine.date().optional().requiredIfExists('birth_place'),
    gender: vine.enum(['pria', 'wanita']).optional(),
    religion: vine.enum(['Kristen', 'Katolik', 'Islam', 'Hindu', 'Budha', 'Konghucu']).optional(),
    address: vine.string().minLength(4).optional(),
    profile_picture: vine.string().optional(),
  })
)

const messages: Record<string, string> = {
  'gender.enum': '{{ field }} harus pria atau wanita',
  'religion.enum':
    '{{ field }} harus salah satu dari Kristen, Katolik, Islam, Hindu, Budha, atau Konghucu',
  'phone.minLength': '{{ field }} harus memiliki panjang minimal 11 karakter',
  'phone.maxLength': '{{ field }} harus memiliki panjang maksimal 13 karakter',
  'birth_date.date': '{{ field }} harus berupa tanggal',
  'birth_date.requiredifexists': '{{ field }} harus diisi',
  'birth_place.string': '{{ field }} harus berupa teks',
  'name.minLength': '{{ field }} harus memiliki panjang minimal 4 karakter',
  'nip.minLength': '{{ field }} harus memiliki panjang minimal 4 karakter',
  'address.minLength': '{{ field }} harus memiliki panjang minimal 4 karakter',
  'profile_picture.minLength': 'URL {{ field }} harus memiliki panjang minimal 4 karakter',
}

const fields = {
  gender: 'Jenis Kelamin',
  religion: 'Agama',
  phone: 'Nomor Telepon',
  birth_date: 'Tanggal Lahir',
  birth_place: 'Tempat Lahir',
  name: 'Nama Lengkap',
  nip: 'NIP',
  address: 'Alamat',
  profile_picture: 'Foto Profil',
}

createTeacherValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateTeacherValidator.messagesProvider = new SimpleMessagesProvider(messages, fields)
