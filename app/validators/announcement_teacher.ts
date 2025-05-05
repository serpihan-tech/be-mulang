import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAnnouncementTeacher = vine.compile(
  vine.object({
    title: vine.string().minLength(4),
    content: vine.string().maxLength(1000),
    date: vine.date(),
    files: vine
      .file({
        size: '3 MB',
        extnames: [
          'jpg',
          'png',
          'jpeg',
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'txt',
          'zip',
          'rar',
        ],
      })
      .optional(),
    category: vine
      .enum([
        'Akademik',
        'Administrasi',
        'Informasi Umum',
        'Kegiatan Sekolah',
        'Fasilitas',
        'Prestasi',
      ])
      .optional(),
    class_id: vine.number().exists({ table: 'classes', column: 'id' }),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }),
  })
)

export const updateAnnouncementTeacher = vine.compile(
  vine.object({
    title: vine.string().minLength(4).optional(),
    content: vine.string().maxLength(1000).optional(),
    date: vine.date().optional(),
    files: vine
      .file({
        size: '3 MB',
        extnames: [
          'jpg',
          'png',
          'jpeg',
          'pdf',
          'doc',
          'docx',
          'xls',
          'xlsx',
          'ppt',
          'pptx',
          'txt',
          'zip',
          'rar',
        ],
      })
      .optional(),
    category: vine
      .enum([
        'Akademik',
        'Administrasi',
        'Informasi Umum',
        'Kegiatan Sekolah',
        'Fasilitas',
        'Prestasi',
      ])
      .optional(),
    class_id: vine.number().exists({ table: 'classes', column: 'id' }).optional(),
    module_id: vine.number().exists({ table: 'modules', column: 'id' }).optional(),
    teacher_id: vine.number().exists({ table: 'teachers', column: 'id' }).optional(),
  })
)

const fields = {
  title: 'Judul',
  content: 'Isi Pengumuman',
  date: 'Tanggal',
  files: 'File',
  category: 'Kategori',
  schedule_id: 'ID Jadwal',
  teacher_id: 'ID Guru',
}

createAnnouncementTeacher.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateAnnouncementTeacher.messagesProvider = new SimpleMessagesProvider(messages, fields)
