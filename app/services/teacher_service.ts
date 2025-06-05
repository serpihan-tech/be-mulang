import Teacher from '#models/teacher'
import db from '@adonisjs/lucid/services/db'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import ClassStudent from '#models/class_student'
import Schedule from '#models/schedule'
import AcademicYear from '#models/academic_year'
import { DateTime } from 'luxon'
import { unlink } from 'node:fs/promises'
import { join as joinPath } from 'node:path'
import exceljs from 'exceljs'

export default class TeacherService implements UserContract {
  async index(params: any, page?: number, limit?: number): Promise<any> {
    const lim = Number(limit) || 10
    const pg = Number(page) || 1

    const sortBy = params.sortBy
    const sortOrder = params.sortOrder

    const teachers = await Teacher.query()
      .if(params.search, (q) =>
        q
          .where('name', 'like', `%${params.search}%`)
          .orWhere('nip', 'like', `%${params.search}%`)
          .orWhere('phone', 'like', `%${params.search}%`)
          .orWhereHas('user', (user) => user.where('email', 'like', `%${params.search}%`))
      )
      .if(sortBy === 'nama', (qs) => qs.orderBy('name', sortOrder || 'asc'))
      .if(sortBy === 'nip', (qs) => qs.orderBy('nip', sortOrder || 'asc'))
      .if(sortBy === 'noTelp', (qs) => qs.orderBy('phone', sortOrder || 'asc'))
      .if(sortBy === 'email', (qs) =>
        qs
          .join('users', 'teachers.user_id', '=', 'users.id')
          .orderBy('users.email', sortOrder || 'asc')
          .select('teachers.*')
      )
      .preload('user')
      .paginate(pg, lim)

    return teachers
  }

  async getIdName(): Promise<any> {
    const teachers = await Teacher.query().select('id', 'name')
    // console.log('teachers : ', teachers)
    return teachers
  }

  async show(id: number): Promise<any> {
    const teacher = await Teacher.query().where('id', id).preload('user').firstOrFail()
    return teacher
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const user = await User.create(data.user, { client: trx })

      await User.assignRole(user, 'teacher')

      const teacher = await Teacher.create(
        {
          user_id: user.id,
          ...data.teacher,
        },
        { client: trx }
      )

      if (data.teacher.profile_picture) {
        const profilePicture = data.student_detail.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/teachers-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        teacher.profilePicture = `teachers-profile/${fileName}`
      }

      await teacher.save()

      await trx.commit()
      return teacher
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(id: number, data: any): Promise<any> {
    const trx = await db.transaction()

    try {
      const teacher = await Teacher.query({ client: trx })
        .where('id', id)
        .preload('user')
        .forUpdate()
        .firstOrFail()

      if (teacher.user) {
        teacher.user.merge({
          email: data.user?.email ?? teacher.user.email,
          username: data.user?.username ?? teacher.user.username,
          password: data.user?.password ?? teacher.user.password,
        })
        await teacher.user.useTransaction(trx).save()
      }

      teacher.merge({
        name: data.teacher?.name ?? teacher.name,
        nip: data.teacher?.nip ?? teacher.nip,
        phone: data.teacher?.phone ?? teacher.phone,
        religion: data.teacher?.religion ?? teacher.religion,
        birthDate: data.teacher?.birth_date ?? teacher.birthDate,
        birthPlace: data.teacher?.birth_place ?? teacher.birthPlace,
        gender: data.teacher?.gender ?? teacher.gender,
        address: data.teacher?.address ?? teacher.address,
      })

      if (data.teacher.profile_picture) {
        const profilePicture = data.teacher.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/teachers-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        teacher.profilePicture = `teachers-profile/${fileName}`
      }

      await teacher.save()

      await trx.commit()
      return teacher
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number): Promise<any> {
    const teacher = await Teacher.query().where('id', id).preload('user').firstOrFail()
    const { profilePicture } = teacher

    const UPLOADS_PATH = app.makePath('storage/uploads') // D:\...\storage\uploads

    if (profilePicture) {
      const fullInPhotoPath = joinPath(UPLOADS_PATH, profilePicture)
      // console.log('Full inPhoto path:', fullInPhotoPath)
      await unlink(fullInPhotoPath)
    }

    return await teacher?.user.delete()
  }

  async getCountStudentsAndClasses(teacherId: number, params?: any): Promise<any> {
    const activeSemester = await this.getActiveSemester()
    const tahunAjar = params.tahunAjar ?? activeSemester.id

    const schedules = await Schedule.query().whereHas('module', (m) =>
      m.where('teacher_id', teacherId).where('academic_year_id', tahunAjar)
    )

    const classIds = schedules.map((item) => item.classId)
    const uniqueClassIds = [...new Set(classIds)]
    const totalClasses = uniqueClassIds.length

    console.log('uniqueClassIds : ', uniqueClassIds)
    console.log('classIds : ', classIds)
    const studentsCount = await ClassStudent.query()
      .where('academic_year_id', tahunAjar)
      .whereIn('class_id', uniqueClassIds)
      .countDistinct('student_id as total_students')

    return {
      totalClasses,
      totalStudents: Number(studentsCount[0].$extras.total_students),
    }
  }

  async downloadExcel(params?: any, user?: User): Promise<Buffer> {
    const teachersPaginated = await this.index(params)
    const teachers: Teacher[] = teachersPaginated.all()

    // console.log('teacher : ', teachers)

    const workbook = new exceljs.Workbook()

    workbook.creator = 'Serpihan Mulang'
    workbook.lastModifiedBy = `${user?.email}` || 'Serpihan Mulang'
    workbook.created = DateTime.now().setZone('Asia/Jakarta').toJSDate()
    workbook.modified = DateTime.now().setZone('Asia/Jakarta').toJSDate()
    workbook.lastPrinted = DateTime.now().setZone('Asia/Jakarta').toJSDate()
    workbook.properties.date1904 = true

    workbook.views = [
      {
        x: 0,
        y: 0,
        width: 10000,
        height: 20000,
        firstSheet: 0,
        activeTab: 1,
        visibility: 'visible',
      },
    ]

    const now = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyyMMdd_HHmmss')
    const worksheet = workbook.addWorksheet(`data_guru_${now}`)
    worksheet.properties.defaultRowHeight = 39

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 5 },
      { header: 'Nama', key: 'name', width: 20 },
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'No Telp', key: 'phone', width: 20 },
      { header: 'Alamat', key: 'address', width: 30 },
      { header: 'Agama', key: 'religion', width: 15 },
      { header: 'Jenis Kelamin', key: 'gender', width: 10 },
      { header: 'Tanggal Lahir', key: 'birth_date', width: 15 },
      { header: 'Tempat Lahir', key: 'birth_place', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
    ]

    teachers.map((teacher, index) => {
      worksheet.addRow({
        id: teacher.id,
        name: teacher.name,
        nip: teacher.nip,
        phone: teacher.phone || '-',
        address: teacher.address || '-',
        religion: teacher.religion || '-',
        gender: teacher.gender || '-',
        birth_date: teacher.birthDate || '-',
        birth_place: teacher.birthPlace || '-',
        email: teacher.user.email || '-',
      })
    })

    const idCol = worksheet.getColumn('id')
    idCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const nameCol = worksheet.getColumn('name')
    nameCol.alignment = { wrapText: true, vertical: 'middle' }
    nameCol.width = 25.55

    const phoneCol = worksheet.getColumn('phone')
    phoneCol.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }

    const nipCol = worksheet.getColumn('nip')
    nipCol.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
    nipCol.width = 22

    const addressCol = worksheet.getColumn('address')
    addressCol.alignment = { wrapText: true }

    const religionCol = worksheet.getColumn('religion')
    religionCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const genderCol = worksheet.getColumn('gender')
    genderCol.alignment = { horizontal: 'center', vertical: 'middle' }
    genderCol.width = 17

    const birthdateCol = worksheet.getColumn('birth_date')
    birthdateCol.width = 24
    birthdateCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const birthplaceCol = worksheet.getColumn('birth_place')
    birthplaceCol.width = 20
    birthplaceCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const emailCol = worksheet.getColumn('email')
    emailCol.alignment = { wrapText: true, horizontal: 'center', vertical: 'middle' }
    emailCol.width = 32

    worksheet.addConditionalFormatting({
      ref: 'A1:J1',
      rules: [
        {
          type: 'expression',
          priority: 1,
          formulae: ['TRUE'],
          style: {
            fill: {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: '0841E2' },
              bgColor: { argb: '0841E2' },
            },
            font: {
              name: 'Segoe UI Semibold',
              size: 12,
              bold: true,
              color: { argb: 'FFFFFFFF' },
            },
            alignment: {
              horizontal: 'center',
            },
          },
        },
      ],
    })

    worksheet.addConditionalFormatting({
      ref: `A1:J${teachers.length + 1}`, // +1 karena ada header di baris 1
      rules: [
        {
          type: 'expression',
          priority: 1,
          formulae: ['TRUE'], // ekspresi valid Excel yang selalu TRUE
          style: {
            border: {
              top: { style: 'thin', color: { argb: '000000' } },
              left: { style: 'thin', color: { argb: '000000' } },
              bottom: { style: 'thin', color: { argb: '000000' } },
              right: { style: 'thin', color: { argb: '000000' } },
            },
          },
        },
      ],
    })

    // Return buffer Excel (controller akan pakai ini)
    const arrayBuffer = await workbook.xlsx.writeBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return buffer
  }

  private async getActiveSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(now)

    return await AcademicYear.query()
      .where('status', 1 || true)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }
}
