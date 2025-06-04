import Teacher from '#models/teacher'
import TeacherAbsence from '#models/teacher_absence'
import { DateTime } from 'luxon'
// import db from '@adonisjs/lucid/services/db'
import TeacherAbsenceContract from '../contracts/teacher_absence_contract.js'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { unlink } from 'node:fs/promises'
import path, { join as joinPath } from 'node:path'
import User from '#models/user'
import exceljs from 'exceljs'
import * as fs from 'node:fs'

export class TeacherAbsenceService implements TeacherAbsenceContract {
  async getAll(params: any): Promise<any> {
    const now = new Date()
    now.setHours(7, 0, 0, 0)

    const tanggal = DateTime.fromISO(params.tanggal).toISODate() ?? now
    console.log('tanggal guru absensi : ', tanggal)

    const teacherAbsence = await Teacher.query()
      .leftJoin('teacher_absences', (join) => {
        join.on('teacher_absences.teacher_id', '=', 'teachers.id')
        join.andOnVal('teacher_absences.date', '=', tanggal)
      })

      // 🔍 FILTER: search by name/NIP
      .if(params.search, (query) =>
        query
          .where('teachers.name', 'like', `%${params.search}%`)
          .orWhere('teachers.nip', 'like', `%${params.search}%`)
      )

      // 🔍 FILTER: specific NIP
      .if(params.nip && params.nip !== '', (query) =>
        query.where('teachers.nip', 'like', `%${params.nip}%`)
      )

      // SELECT: teacher + check_in_time sebagai kolom agregat
      .select('teachers.*')
      .select(db.raw('MAX(teacher_absences.check_in_time) as check_in_time')) // untuk sorting jamMasuk
      .select(db.raw('MAX(teacher_absences.check_out_time) as check_out_time')) // opsional jika ingin sorting jamPulang
      .select(db.raw('MAX(teacher_absences.status) as status')) // opsional jika ingin sorting status

      // GROUP BY: agar sesuai ONLY_FULL_GROUP_BY
      .groupBy('teachers.id')

      // 🧭 SORTING
      .if(params.sortBy === 'nama', (query) =>
        query.orderBy('teachers.name', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'nip', (query) =>
        query.orderBy('teachers.nip', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'status', (query) => query.orderBy('status', params.sortOrder || 'asc'))
      .if(params.sortBy === 'jamMasuk', (query) =>
        query.orderBy('check_in_time', params.sortOrder || 'asc')
      )
      .if(params.sortBy === 'jamPulang', (query) =>
        query.orderBy('check_out_time', params.sortOrder || 'asc')
      )

      // 📦 RELASI preload user dan latestAbsence
      .preload('user', (u) => u.select('email'))
      .preload('latestAbsence', (ab) => {
        ab.where('date', tanggal)
        if (params.status) {
          ab.where('status', params.status)
        }
      })

      // PAGINATION
      .paginate(params.page || 1, params.limit || 10)

    // console.log(await TeacherAbsence.query().where('id', 12).firstOrFail())
    return teacherAbsence
  }

  async getOne(teacherAbsenceId: number): Promise<Object> {
    const teacherAbsence = await TeacherAbsence.query()
      .where('id', teacherAbsenceId)
      .preload('teacher', (t) =>
        t.select('id', 'user_id', 'name', 'nip', 'phone').preload('user', (u) => u.select('email'))
      )
      .firstOrFail()

    return teacherAbsence
  }

  async create(data: any): Promise<Object> {
    const trx = await db.transaction()
    try {
      const teacherAbsence = await TeacherAbsence.create(
        {
          teacherId: data.teacher_id,
          date: data.date,
          status: data.status,
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
        },
        { client: trx }
      )

      if (data.in_photo) {
        const latestPhoto = data.in_photo
        const teacher = await Teacher.query().where('id', 3).firstOrFail()
        const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')

        const fileName = `${teacherName}.${data.date}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${data.date}/check-in-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        // Simpan path file ke dalam database
        teacherAbsence.inPhoto = `teacher-absences/${data.date}/check-in-photos/${fileName}`
      }

      if (data.out_photo) {
        const latestPhoto = data.out_photo
        const teacher = await Teacher.query().where('id', 3).firstOrFail()
        const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')

        const fileName = `${teacherName}.${data.date}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${data.date}/check-out-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        // Simpan path file ke dalam database
        teacherAbsence.outPhoto = `teacher-absences/${data.date}/check-out-photos/${fileName}`
      }

      await teacherAbsence.save()
      await trx.commit()

      return teacherAbsence
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(teacherAbsenceId: number, data: any): Promise<Object> {
    const trx = await db.transaction()
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()

    // console.log('dateInput : ', teacherAbsence.date)

    try {
      console.log('teacherAbsence : ', teacherAbsence)
      await teacherAbsence
        .merge({
          date: data.date ?? teacherAbsence.date,
          status: data.status,
          checkInTime: data.check_in_time,
          checkOutTime: data.check_out_time,
        })
        .save()

      const teacher = await Teacher.query().where('id', teacherAbsence.teacherId).firstOrFail()
      const teacherName = teacher.name.toLowerCase().replace(/\s/g, '-')
      const dateInput = data.date ?? teacherAbsence.date.toISOString().split('T')[0]

      if (data.in_photo) {
        const latestPhoto = data.in_photo
        const fileName = `${teacherName}.${dateInput}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${dateInput}/check-in-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        teacherAbsence.inPhoto = `teacher-absences/${dateInput}/check-in-photos/${fileName}`
      }

      if (data.out_photo) {
        const latestPhoto = data.out_photo
        const fileName = `${teacherName}.${dateInput}.${latestPhoto.extname}`

        await latestPhoto.move(
          app.makePath(`storage/uploads/teacher-absences/${dateInput}/check-out-photos`),
          {
            name: fileName,
            overwrite: true,
          }
        )

        teacherAbsence.outPhoto = `teacher-absences/${dateInput}/check-out-photos/${fileName}`
      }

      await teacherAbsence.save()
      await trx.commit()

      return teacherAbsence
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(teacherAbsenceId: number): Promise<void> {
    const teacherAbsence = await TeacherAbsence.query().where('id', teacherAbsenceId).firstOrFail()
    const { inPhoto, outPhoto } = teacherAbsence

    const UPLOADS_PATH = app.makePath('storage/uploads') // D:\...\storage\uploads

    if (inPhoto) {
      const fullInPhotoPath = joinPath(UPLOADS_PATH, inPhoto)
      // console.log('Full inPhoto path:', fullInPhotoPath)
      await unlink(fullInPhotoPath)
    }

    if (outPhoto) {
      const fullOutPhotoPath = joinPath(UPLOADS_PATH, outPhoto)
      // console.log('Full outPhoto path:', fullOutPhotoPath)
      await unlink(fullOutPhotoPath)
    }

    await teacherAbsence.delete()
  }

  async presenceToday(teacherId: number) {
    const now = DateTime.local().toISODate()

    // console.log('presenceToday : ', now)
    const teacherAbsence = await TeacherAbsence.query()
      .where('teacher_id', teacherId)
      .where('date', now)
      .first()

    // console.log('teacherAbsence : ', teacherAbsence)
    return teacherAbsence
  }

  async downloadExcel(params?: any, user?: User) {
    const teacherAbsencesPaginated = await this.getAll(params)
    const teacherAbsences = teacherAbsencesPaginated.all()

    const workbook = new exceljs.Workbook()
    console.log('teacherAbsences : ', teacherAbsences)

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
    const worksheet = workbook.addWorksheet(`data_presensi_guru_${now}`)

    worksheet.columns = [
      { header: 'ID Guru', key: 'teacher_id', width: 9.2, style: { font: { bold: true } } },
      { header: 'Nama', key: 'name', width: 30, style: { font: { bold: true } } },
      { header: 'NIP', key: 'nip', width: 25, style: { font: { bold: true } } },
      { header: 'Tanggal', key: 'date', width: 17.55, style: { font: { bold: true } } },
      { header: 'Jam Masuk', key: 'check_in_time', width: 15, style: { font: { bold: true } } },
      { header: 'Jam Keluar', key: 'check_out_time', width: 15, style: { font: { bold: true } } },
      { header: 'Status', key: 'status', width: 15, style: { font: { bold: true } } },
      {
        header: 'Foto Masuk',
        key: 'in_photo',
        width: 30,
        style: { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } },
      },
      {
        header: 'Foto Keluar',
        key: 'out_photo',
        width: 30,
        style: { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'middle' } },
      },
    ]
    worksheet.properties.defaultRowHeight = 21.75

    teacherAbsences.forEach((teacherAbsence: any, index: number) => {
      const rowIndex = index + 2

      worksheet.addRow({
        teacher_id: teacherAbsence.id,
        name: teacherAbsence.name,
        nip: teacherAbsence.nip,
        date: teacherAbsence.latestAbsence?.date || '-',
        check_in_time: teacherAbsence.latestAbsence?.checkInTime || '-',
        check_out_time: teacherAbsence.latestAbsence?.checkOutTime || '-',
        status: teacherAbsence.latestAbsence?.status || '-',
        in_photo: '',
        out_photo: '',
      })

      const inPhoto = teacherAbsence.latestAbsence?.inPhoto
      const outPhoto = teacherAbsence.latestAbsence?.outPhoto

      if (!inPhoto || typeof inPhoto !== 'string' || inPhoto.trim() === '') {
        worksheet.getCell(`H${rowIndex}`).value = '-'
      }

      if (!outPhoto || typeof outPhoto !== 'string' || outPhoto.trim() === '') {
        worksheet.getCell(`I${rowIndex}`).value = '-'
      }

      const row = worksheet.getRow(rowIndex)

      // tinggi baris default jika tidak ada gambar
      if (
        (!teacherAbsence.latestAbsence?.inPhoto ||
          teacherAbsence.latestAbsence?.inPhoto.trim() === '') &&
        (!teacherAbsence.latestAbsence?.outPhoto ||
          teacherAbsence.latestAbsence?.outPhoto.trim() === '')
      ) {
        row.height = 21.75
      }

      this.getImageForExcel(worksheet, workbook, teacherAbsence, rowIndex)
    })

    const idCol = worksheet.getColumn('teacher_id')
    idCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const nameCol = worksheet.getColumn('name')
    nameCol.alignment = { vertical: 'middle' }

    const nipCol = worksheet.getColumn('nip')
    nipCol.alignment = { vertical: 'middle' }

    const dateCol = worksheet.getColumn('date')
    dateCol.numFmt = 'dd-mm-yyyy'
    dateCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const checkInTimeCol = worksheet.getColumn('check_in_time')
    checkInTimeCol.numFmt = 'HH:mm:ss'
    checkInTimeCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const checkOutTimeCol = worksheet.getColumn('check_out_time')
    checkOutTimeCol.numFmt = 'HH:mm:ss'
    checkOutTimeCol.alignment = { horizontal: 'center', vertical: 'middle' }

    const statusCol = worksheet.getColumn('status')
    statusCol.numFmt = 'HH:mm:ss'
    statusCol.alignment = { horizontal: 'center', vertical: 'middle' }

    worksheet.addConditionalFormatting({
      ref: 'A1:I1',
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
      ref: `A2:I${teacherAbsences.length + 1}`, // baris 2 sampai akhir data
      rules: [
        // Alpha = merah
        {
          type: 'expression',
          priority: 2,
          formulae: ['INDIRECT("G"&ROW())="Alfa"'],
          style: {
            font: {
              color: { argb: 'FF0000' }, // merah
            },
          },
        },
      ],
    })

    worksheet.addConditionalFormatting({
      ref: `A1:I${teacherAbsences.length + 1}`, // +1 karena ada header di baris 1
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

    const arrayBuffer = await workbook.xlsx.writeBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return buffer
  }

  private maxColumnWidths = {
    7: 0,
    8: 0,
  }

  private getImageForExcel(
    worksheet: exceljs.Worksheet,
    workbook: exceljs.Workbook,
    teacher: Teacher,
    rowIndex: number
  ) {
    const inFilename = teacher.latestAbsence?.inPhoto
    const outFilename = teacher.latestAbsence?.outPhoto

    const defaultWidth = 240
    const defaultHeight = 240
    const scaleFactor = 2 // skala 2x lebih kecil

    if (inFilename && typeof inFilename === 'string' && inFilename.trim() !== '') {
      const inPhotoPath = path.join(app.makePath('storage/uploads'), inFilename)

      if (fs.existsSync(inPhotoPath)) {
        const scaledWidth = defaultWidth / scaleFactor
        const scaledHeight = defaultHeight / scaleFactor

        if (scaledWidth > this.maxColumnWidths[7]) {
          this.maxColumnWidths[7] = scaledWidth
        }

        const inImageId = workbook.addImage({
          filename: inPhotoPath,
          extension: 'jpeg',
        })

        worksheet.addImage(inImageId, {
          tl: { col: 7, row: rowIndex - 1 },
          ext: { width: scaledWidth, height: scaledHeight },
          editAs: 'oneCell',
        })

        if (
          !worksheet.getRow(rowIndex).height ||
          worksheet.getRow(rowIndex).height < scaledHeight
        ) {
          worksheet.getRow(rowIndex).height = scaledHeight
        }
      }
    }

    if (outFilename && typeof outFilename === 'string' && outFilename.trim() !== '') {
      const outPhotoPath = path.join(app.makePath('storage/uploads'), outFilename)

      if (fs.existsSync(outPhotoPath)) {
        const scaledWidth = defaultWidth / scaleFactor
        const scaledHeight = defaultHeight / scaleFactor

        if (scaledWidth > this.maxColumnWidths[8]) {
          this.maxColumnWidths[8] = scaledWidth
        }

        const outImageId = workbook.addImage({
          filename: outPhotoPath,
          extension: 'jpeg',
        })

        worksheet.addImage(outImageId, {
          tl: { col: 8, row: rowIndex - 1 },
          ext: { width: scaledWidth, height: scaledHeight },
          editAs: 'oneCell',
        })

        if (
          !worksheet.getRow(rowIndex).height ||
          worksheet.getRow(rowIndex).height < scaledHeight
        ) {
          worksheet.getRow(rowIndex).height = scaledHeight
        }
      }
    }
  }
}
