import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import { AnnouncementByTeacherService } from '#services/announcement_by_teacher_service'
import {
  createAnnouncementTeacher,
  updateAnnouncementTeacher,
} from '#validators/announcement_teacher'
import User from '#models/user'

@inject()
export default class AnnouncementByTeachersController {
  constructor(private announcementService: AnnouncementByTeacherService) {}

  public async index({ auth, request, response }: HttpContext) {
    try {
      const user = auth.getUserOrFail()

      const role = await User.getRole(user)
      // console.log('index, announcement teacher : role = ', role.role)

      let teacher
      let data = request.all()
      if (role.role === 'teacher') {
        teacher = await user.related('teacher').query().firstOrFail()
        data = { ...data, teacher_id: teacher.id }
      }

      const announcements = await this.announcementService.getAll(data, role.role)
      return {
        message: 'Pengumuman Berhasil Di Tampilkan',
        announcements,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.getOne(params.id)
      return {
        message: 'Pengumuman Berhasil Di Tampilkan',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async store({ auth, request, response }: HttpContext) {
    console.log('store controller announcement by teacher : ', request.all())
    try {
      const us = auth.getUserOrFail()
      await us.load('teacher')

      if (!us.teacher) {
        return response.forbidden({ error: { message: 'Anda Tidak Punya Akses!' } })
      }

      const teacherId: number = us.teacher.id

      const files = request.file('files')
      const data = request.all()

      if (files) data.files = files
      data.teacher_id = teacherId

      console.log('data : ', data)
      await createAnnouncementTeacher.validate(data)

      const announcement = await this.announcementService.create(data)
      return {
        message: 'Pengumuman Berhasil Di Tambahkan',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async update({ auth, params, request, response }: HttpContext) {
    try {
      const files = request.file('files')
      const data = request.all()

      if (files) data.files = files

      await updateAnnouncementTeacher.validate(data)

      const announcement = await this.announcementService.update(data, params.id)
      return {
        message: 'Pengumuman Berhasil Di Ubah',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      const announcement = await this.announcementService.delete(params.id)
      return {
        message: 'Pengumuman Berhasil Di Hapus',
        announcement,
      }
    } catch (error) {
      return response.badRequest({ error })
    }
  }
}
