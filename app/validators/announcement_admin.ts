import vine, { SimpleMessagesProvider } from '@vinejs/vine'
import { messages } from '../utils/validation_message.js'

export const createAnnouncementAdmin = vine.compile(
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
    category: vine.enum([
      'Akademik',
      'Administrasi',
      'Informasi Umum',
      'Kegiatan Sekolah',
      'Fasilitas',
      'Prestasi',
    ]),
    // .optional(),
    target_roles: vine.enum(['student', 'teacher']),
  })
)

export const updateAnnouncementAdmin = vine.compile(
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
    targetRoles: vine.enum(['student', 'teacher']).optional(),
  })
)

const fields = {
  title: 'Judul',
  content: 'Isi Pengumuman',
  date: 'Tanggal',
  files: 'File',
  category: 'Kategori',
  targetRoles: 'Target',
}

createAnnouncementAdmin.messagesProvider = new SimpleMessagesProvider(messages, fields)
updateAnnouncementAdmin.messagesProvider = new SimpleMessagesProvider(messages, fields)
