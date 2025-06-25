import Student from '#models/student'
import Schedule from '#models/schedule'
import Absence from '#models/absence'
import ClassStudent from '#models/class_student'
import db from '@adonisjs/lucid/services/db'
import StudentContract from '../contracts/student_contract.js'
import UserContract from '../contracts/user_contract.js'
import User from '#models/user'
import StudentDetail from '#models/student_detail'
import AcademicYear from '#models/academic_year'
import Class from '#models/class'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import { unlink } from 'node:fs/promises'
import { join as joinPath } from 'node:path'
import exceljs from 'exceljs'

export default class StudentsService implements StudentContract, UserContract {
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

  // Mengambil data semua siswa
  async index(page: number, params?: any): Promise<any> {
    const pages = page
    const limit = 10

    const sortBy = params.sortBy
    const sortOrder = params.sortOrder

    const activeAcademicYear = await this.getActiveSemester()
    const activeAcademicYearId = params.tahunAjar ? Number(params.tahunAjar) : activeAcademicYear.id
    console.log('activeAcademicYearId : ', activeAcademicYearId)

    const kelas = Array.isArray(params.kelas)
      ? params.kelas.map((k: string) => (k ?? '').toString().trim())
      : [(params.kelas ?? '').toString().trim()]

    console.log(kelas)
    const students = await Student.query()
      .select('students.*')
      .where('is_graduate', params.status || 0)
      .whereHas('classStudent', (cs) => {
        cs.whereHas('academicYear', (ay) => {
          ay.where('id', activeAcademicYearId)
        })

        cs.preload('class')

        if (params.kelas) {
          cs.whereHas('class', (c) => {
            c.whereIn('name', kelas)
          })
        }

        if (params.search) {
          cs.where((subquery) => {
            subquery
              .whereHas('student', (query) => {
                query
                  .where('name', 'like', `%${params.search}%`)
                  .orWhereHas('user', (u) => u.where('email', 'like', `%${params.search}%`))
                  .orWhereHas('studentDetail', (sd) =>
                    sd
                      .where('nis', 'like', `%${params.search}%`)
                      .orWhere('nisn', 'like', `%${params.search}%`)
                      .orWhere('students_phone', 'like', `%${params.search}%`)
                  )
              })
              .orWhereHas('class', (c) => c.where('name', 'like', `%${params.search}%`)) // Pindahkan ke dalam classStudent
          })
        }
      })

      // *                    SORTING FILTER                     */
      .if(sortBy === 'kelas', (query) => {
        query
          .whereHas('classStudent', (cs) => {
            cs.where('academic_year_id', activeAcademicYearId)
          })
          .orderBy(
            db
              .from('class_students')
              .join('classes', 'class_students.class_id', 'classes.id')
              .whereRaw('class_students.student_id = students.id')
              .where('class_students.academic_year_id', activeAcademicYearId)
              .select('classes.name')
              .limit(1),
            sortOrder || 'asc'
          )
      }) // NAMA KELAS
      .if(sortBy === 'email', (q) => {
        q.leftJoin('users', 'students.user_id', 'users.id').orderBy(
          'users.email',
          sortOrder || 'asc'
        )
      }) // EMAIL
      .if(sortBy === 'nama', (query) => query.orderBy('name', sortOrder || 'asc')) // NAMA STUDENT
      .if(
        sortBy === 'nis',
        (query) =>
          query
            .leftJoin('student_details', 'students.id', 'student_details.student_id')
            .orderBy('nis', sortOrder || 'asc') // NIS
      )
      .if(
        sortBy === 'jenisKelamin',
        (query) =>
          query
            .leftJoin('student_details', 'students.id', 'student_details.student_id')
            .orderBy('gender', sortOrder || 'asc') // NIS
      )
      .if(
        sortBy === 'nisn',
        (query) =>
          query
            .leftJoin('student_details', 'students.id', 'student_details.student_id')
            .orderBy('nisn', sortOrder || 'asc') // NISN
      )
      .if(sortBy === 'tahunAjar', (query) => {
        query
          .whereHas('classStudent', (cs) => {
            cs.where('academic_year_id', activeAcademicYearId)
          })
          .orderBy(
            db
              .from('class_students')
              .join('academic_years', 'class_students.academic_year_id', 'academic_years.id')
              .whereRaw('class_students.student_id = students.id')
              .where('class_students.academic_year_id', activeAcademicYearId)
              .select('academic_years.name')
              .limit(1),
            sortOrder || 'asc'
          )
      }) // TAHUN AJAR BY NAMANYA
      // *                    SORTING FILTER                     */

      .if(params.jenisKelamin, (query) =>
        query.whereHas('studentDetail', (sd) => sd.where('gender', params.jenisKelamin))
      ) // JENIS KELAMIN

      .if(params.tahunAjar, (query) => {
        query.whereHas('classStudent', (cs) => {
          cs.whereHas('academicYear', (ay) => {
            ay.where('id', activeAcademicYearId)
          })
        })
      }) // TAHUN AJAR BY NAMANYA
      .preload('user')
      .preload('studentDetail')
      .preload('classStudent', (cs) => {
        cs.whereHas('academicYear', (ay) => {
          ay.where('id', activeAcademicYearId)
        })
        cs.preload('academicYear')
        cs.preload('class')
        if (params.kelas) {
          cs.whereHas('class', (c) => {
            c.whereIn('name', kelas)
          })
        }
      })
      .paginate(pages, Number(params.limit) || limit)

    return students
  }

  async show(id: number): Promise<any> {
    const activeAcademicYear = await this.getActiveSemester()

    return await Student.query()
      .where('id', id)
      .preload('user')
      .preload('studentDetail')
      .preload('classStudent', (cs) => {
        cs.preload('class')
        cs.preload('academicYear')
        cs.whereHas('academicYear', (ay) => {
          ay.where('id', activeAcademicYear.id)
        })
      })
      .firstOrFail()
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()

    try {
      const user = await User.create(data.user, { client: trx })

      await User.assignRole(user, 'student')

      const student = await Student.create(
        {
          userId: user.id,
          name: data.student.name,
          isGraduate: data.student.is_graduate || 0,
        },
        { client: trx }
      )

      await StudentDetail.create(
        {
          student_id: student.id,
          ...data.student_detail,
        },
        { client: trx }
      )

      if (data.student_detail.profile_picture) {
        const profilePicture = data.student_detail.profile_picture
        const fileName = `${cuid()}.${profilePicture.extname}`

        // Pindahkan file hanya jika `profile_picture` ada dan valid
        await profilePicture.move(app.makePath('storage/uploads/students-profile'), {
          name: fileName,
        })

        // Simpan path file ke dalam database
        student.studentDetail.profilePicture = `students-profile/${fileName}`
        await student.studentDetail.save()
      }

      if (data.class_student) {
        await ClassStudent.create(
          {
            studentId: student.id,
            classId: data.class_student.class_id,
            academicYearId: data.class_student.academic_year_id,
          },
          { client: trx }
        )
      }

      await student.useTransaction(trx).load('user')
      await student.useTransaction(trx).load('studentDetail')
      await student.useTransaction(trx).load('classStudent')

      await trx.commit()

      return student
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(studentId: number, data: any): Promise<any> {
    const trx = await db.transaction()
    const activeAcademicYear = await this.getActiveSemester()

    try {
      const student = await Student.query({ client: trx })
        .where('id', studentId)
        .preload('user')
        .preload('studentDetail')
        .preload('classStudent', (cs) => {
          cs.whereHas('academicYear', (ay) => {
            ay.where('id', activeAcademicYear.id)
          })
          cs.preload('academicYear')
          cs.preload('class')
        })
        .firstOrFail()

      if (data.user) {
        student.user.merge({
          email: data.user.email ?? student.user.email,
          username: data.user.username ?? student.user.username,
          password: data.user.password ?? student.user.password,
        })
        await student.user.save()
      }

      if (data.student) {
        student.merge({
          name: data.student.name ?? student.name,
          isGraduate: data.student.is_graduate ?? student.isGraduate,
        })
        await student.save()
      }

      if (data.class_student) {
        console.log(student.classStudent, 'id classStudent :', data.class_student.class_student_id)
        const classStudentId = Number(data.class_student.class_student_id)

        await student.classStudent
          .find((cs) => cs.id === classStudentId)
          ?.merge({
            classId: data.class_student.class_id,
            academicYearId: data.class_student.academic_year_id,
          })
          .save()
      }

      console.info('STUDENT DETAIL : ', data.student_detail)
      if (data.student_detail && student.studentDetail) {
        student.studentDetail.merge({
          nis: data.student_detail.nis ?? student.studentDetail.nis,
          nisn: data.student_detail.nisn ?? student.studentDetail.nisn,
          gender: data.student_detail.gender ?? student.studentDetail.gender,
          birthDate: data.student_detail.birth_date ?? student.studentDetail.birthDate,
          birthPlace: data.student_detail.birth_place ?? student.studentDetail.birthPlace,
          address: data.student_detail.address ?? student.studentDetail.address,
          enrollmentYear:
            data.student_detail.enrollment_year ?? student.studentDetail.enrollmentYear,
          parentsName: data.student_detail.parents_name ?? student.studentDetail.parentsName,
          parentsPhone: data.student_detail.parents_phone ?? student.studentDetail.parentsPhone,
          parentsJob: data.student_detail.parents_job ?? student.studentDetail.parentsJob,
          studentsPhone: data.student_detail.students_phone ?? student.studentDetail.studentsPhone,
          profilePicture:
            data.student_detail.profile_picture ?? student.studentDetail.profilePicture,
        })

        if (data.student_detail.profile_picture) {
          const profilePicture = data.student_detail.profile_picture
          const fileName = `${cuid()}.${profilePicture.extname}`

          // Pindahkan file hanya jika `profile_picture` ada dan valid
          await profilePicture.move(app.makePath('storage/uploads/students-profile'), {
            name: fileName,
          })

          // Simpan path file ke dalam database
          student.studentDetail.profilePicture = `students-profile/${fileName}`
        }

        await student.studentDetail.save()
      }

      await trx.commit()

      // await student.load('user')
      // await student.load('studentDetail')
      // await student.load('classStudent')

      return student
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number): Promise<any> {
    const student = await Student.query().where('id', id).preload('studentDetail').firstOrFail()
    const name = student.name

    const { profilePicture } = student.studentDetail

    const UPLOADS_PATH = app.makePath('storage/uploads') // D:\...\storage\uploads

    if (profilePicture) {
      const fullInPhotoPath = joinPath(UPLOADS_PATH, profilePicture)
      // console.log('Full inPhoto path:', fullInPhotoPath)
      await unlink(fullInPhotoPath)
    }

    await User.query().where('id', student.userId).delete()

    return name
  }

  /**
   * Mengambil informasi kelas siswa berdasarkan student_id.
   */
  async getClassStudent(studentId: number) {
    return await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'academic_year_id')
      .preload('academicYear')
      .preload('class')
      .first()
  }

  /**
   * Mengambil jadwal pelajaran berdasarkan studentId.
   */
  async getSchedule(studentId: number, params?: any): Promise<any[]> {
    if (!studentId) throw new Error('ID siswa tidak ditemukan')

    const activeAcademicYear = await this.getActiveSemester()
    const activeSemesterId = params.tahunAjar ? params.tahunAjar : activeAcademicYear.id
    console.log('activeSemesterId', activeSemesterId)
    const classStudent = await ClassStudent.query()
      .where('student_id', studentId)
      .select('class_id', 'academic_year_id')
      .whereHas('academicYear', (ay) => {
        ay.where('id', activeSemesterId)
      })
      .first()

    if (!classStudent) return []

    return await Schedule.query()
      .where('class_id', classStudent.classId)
      .whereHas('module', (m) => {
        m.where('academic_year_id', activeSemesterId)
      })
      .preload('module', (m) =>
        m.preload('teacher', (t) => {
          t.select('id', 'name')
        })
      )
      .preload('room')
  }
  /**
   * Mengambil data presensi siswa berdasarkan student_id.
   * Presensi yang diambil hanya dari tahun ajar yang aktif.
   */
  async getPresence(studentId: number, params?: any) {
    const student = await Student.query().where('id', studentId).firstOrFail()

    const activeAcademicYear = await this.getActiveSemester()
    console.log(
      await Absence.query()
        .join('class_students', 'absences.class_student_id', '=', 'class_students.id')
        .join('students', 'class_students.student_id', '=', 'students.id')
        .join('academic_years', 'class_students.academic_year_id', '=', 'academic_years.id')
        .where('class_students.student_id', studentId)
        .where('class_students.academic_year_id', activeAcademicYear.id)
    )

    const result = await Absence.query()
      .join('class_students', 'absences.class_student_id', '=', 'class_students.id')
      .join('students', 'class_students.student_id', '=', 'students.id')
      .join('academic_years', 'class_students.academic_year_id', '=', 'academic_years.id')
      .where('class_students.student_id', studentId)
      .where('class_students.academic_year_id', activeAcademicYear.id)
      .select(
        'students.name as student_name',
        db.raw(`COUNT(DISTINCT absences.date) as total`),
        db.raw(`
        COUNT(DISTINCT CASE 
          WHEN absences.status = 'Hadir' AND 
          absences.date NOT IN (
            SELECT date FROM absences WHERE class_student_id = class_students.id AND status IN ('Sakit', 'Izin', 'Alfa')
          ) 
        THEN absences.date END) as hadir
      `),
        db.raw(`
        COUNT(DISTINCT CASE 
          WHEN absences.status IN ('Sakit', 'Izin', 'Alfa') 
        THEN absences.date END) as tidak_hadir
      `)
      )
      .groupBy('students.name')
      .first()

    return {
      student_name: student.name ?? null,
      tahun_ajar: activeAcademicYear.name ?? null,
      semester: activeAcademicYear.semester ?? null,
      total: result?.$extras.total ?? 0,
      hadir: result?.$extras.hadir ?? 0,
      tidak_hadir: result?.$extras.tidak_hadir ?? 0,
    }
  }

  async studentPromoted(data: any) {
    try {
      const classId = data.class_id
      const academicYearId = data.academic_year_id

      console.log('data : ', data)
      for (const datum of data.student_ids) {
        console.log('datum : ', datum)
        const student = await Student.query().where('id', datum).firstOrFail()

        const kelas = await Class.query().where('id', classId).firstOrFail()

        const academicYear = await AcademicYear.query().where('id', academicYearId).firstOrFail()

        await ClassStudent.create({
          studentId: student.id,
          classId: kelas.id,
          academicYearId: academicYear.id,
        })
      }
    } catch (error) {
      throw error
    }
  }

  async downloadExcel(params?: any, user?: User): Promise<Buffer> {
    const studentsPaginated = await this.index(params.page, params)
    const students = studentsPaginated.all()

    const workbook = new exceljs.Workbook()
    console.log('students : ', students)

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
    const worksheet = workbook.addWorksheet(`data_siswa_${now}`)

    worksheet.columns = [
      { header: 'ID Siswa', key: 'student_id', width: 9.8, style: { font: { bold: true } } },
      { header: 'NIS', key: 'nis', width: 24, style: { font: { bold: true } } },
      { header: 'NISN', key: 'nisn', width: 24, style: { font: { bold: true } } },
      { header: 'Nama Lengkap', key: 'name', width: 35, style: { font: { bold: true } } },
      { header: 'Email', key: 'email', width: 35, style: { font: { bold: true } } },
      { header: 'Kelas', key: 'class_name', width: 20, style: { font: { bold: true } } },
      { header: 'Jenis Kelamin', key: 'gender', width: 20, style: { font: { bold: true } } },
      { header: 'Tahun Ajaran', key: 'academic_year', width: 22, style: { font: { bold: true } } },
    ]
    worksheet.properties.defaultRowHeight = 46

    students.forEach((student: any) => {
      const academicYear = student.classStudent?.[0]?.academicYear

      worksheet.addRow({
        student_id: student.id,
        nis: student.studentDetail?.nis ?? '-',
        nisn: student.studentDetail?.nisn ?? '-',
        name: student.name ?? '-',
        email: student.user?.email ?? '-',
        class_name: student.classStudent[0]?.class?.name ?? '-',
        gender: student.studentDetail?.gender ?? '-',
        academic_year: academicYear
          ? `${academicYear.name} ${academicYear.semester.charAt(0).toUpperCase()}${academicYear.semester.slice(1)}`
          : '-',
      })
    })

    const idCol = worksheet.getColumn('student_id')
    idCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const nameCol = worksheet.getColumn('name')
    nameCol.alignment = { vertical: 'middle', wrapText: true }

    const nisCol = worksheet.getColumn('nis')
    nisCol.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

    const nisnCol = worksheet.getColumn('nisn')
    nisnCol.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

    const kelasCol = worksheet.getColumn('class_name')
    kelasCol.alignment = { horizontal: 'center', vertical: 'middle' }
    kelasCol.values = kelasCol.values.map((value: any, index: number) => {
      if (index === 1 || typeof value !== 'string') return value
      return value.toUpperCase()
    })

    const emailCol = worksheet.getColumn('email')
    emailCol.alignment = { vertical: 'middle' }

    const genderCol = worksheet.getColumn('gender')
    genderCol.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }

    const academicYearCol = worksheet.getColumn('academic_year')
    academicYearCol.alignment = { horizontal: 'center', vertical: 'middle' }

    worksheet.addConditionalFormatting({
      ref: 'A1:H1',
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

    const arrayBuffer = await workbook.xlsx.writeBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return buffer
  }
}
