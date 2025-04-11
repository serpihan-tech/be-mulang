import Class from '#models/class'
import db from '@adonisjs/lucid/services/db'
import ClassContract from '../contracts/class_contract.js'
import ModelFilter from '../utils/filter_query.js'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'

export class ClassService implements ClassContract {
  async activeSemester() {
    const now =
      DateTime.now().setZone('Asia/Jakarta').toSQL() ??
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    console.log(now)

    return await AcademicYear.query()
      .where('status', 1)
      .where('date_start', '<', now)
      .where('date_end', '>', now)
      .firstOrFail()
  }

  async getAll(params?: any) {
    const activeSemester = await this.activeSemester()

    const sortBy = params.sortBy
    const sortOrder = params.sortOrder
    const semesterId = params.tahunAjar ? params.tahunAjar : activeSemester.id
    console.log(params.tahunAjar)
    const theClass = await Class.query()
      .select('classes.id', 'classes.name', 'classes.teacher_id')
      .withCount('classStudent', (cs) =>
        cs.as('total_student').where('academic_year_id', semesterId)
      )
      .preload('teacher', (t) => t.select('teachers.id', 'teachers.name'))
      .if(params.search, (q) =>
        q
          .where('classes.name', 'like', `%${params.search}%`)
          .orWhere('classes.id', 'like', `%${params.search}%`)
          .orWhereHas('teacher', (teacher) =>
            teacher.where('teachers.name', 'like', `%${params.search}%`)
          )
          .orWhereRaw(
            `CAST((SELECT COUNT(*) FROM class_students WHERE class_students.class_id = classes.id AND class_students.academic_year_id = ?) AS CHAR) LIKE ?`,
            [semesterId, `%${params.search}%`]
          )
      )
      .if(sortBy === 'id', (qs) => qs.orderBy('classes.id', sortOrder || 'asc'))
      .if(sortBy === 'kelas', (qs) => qs.orderBy('classes.name', sortOrder || 'asc'))
      .if(sortBy === 'waliKelas', (qs) =>
        qs
          .join('teachers', 'classes.teacher_id', 'teachers.id')
          .orderBy('teachers.name', sortOrder || 'asc')
      )
      .if(sortBy === 'jumlahSiswa', (qs) =>
        qs
          .leftJoin('class_students', function (join) {
            join
              .on('classes.id', '=', 'class_students.class_id')
              .onVal('class_students.academic_year_id', semesterId)
          })
          .groupBy('classes.id')
          .select('classes.id', 'classes.name', 'classes.teacher_id')
          .count('class_students.id as total_student')
          .orderBy('total_student', sortOrder || 'desc')
      )

      .paginate(params.page || 1, params.limit || 10)

    const formattedData = theClass.all().map((item) => ({
      id: item.id, // Gunakan alias class_id
      name: item.name,
      teacherId: item.teacherId,
      teacher: {
        id: item.teacher.id,
        name: item.teacher.name,
      },
      totalStudents: item.$extras.total_student,
    }))

    return {
      meta: theClass.getMeta(),
      theClass: formattedData,
    }
  }

  async getOne(id: number, params?: any) {
    const activeSemester = await this.activeSemester()

    const semesterId = params.tahunAjar ? params.tahunAjar : activeSemester.id

    const theClass = await Class.query()
      .where('id', id)
      .select('id', 'name', 'teacher_id')
      .withCount('classStudent', (cs) =>
        cs.as('total_student').where('academic_year_id', semesterId)
      )
      .preload('teacher', (t) => t.select('id', 'name'))
      .firstOrFail()

    const formattedData = {
      id: theClass.id,
      name: theClass.name,
      teacherId: theClass.teacherId,
      teacher: {
        id: theClass.teacher.id,
        name: theClass.teacher.name,
      },
      totalStudents: theClass.$extras.total_student,
    }

    return formattedData
  }

  async create(data: any): Promise<any> {
    const trx = await db.transaction()
    try {
      const theClass = await Class.create(data, { client: trx })
      await trx.commit()
      return theClass
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async update(data: any, classId: number): Promise<any> {
    const trx = await db.transaction()
    try {
      const theClass = await Class.query({ client: trx }).where('id', classId).firstOrFail()
      theClass.merge({
        name: data.name ?? theClass.name,
        teacherId: data.teacher_id ?? theClass.teacherId,
      })

      await theClass.useTransaction(trx).save()
      await trx.commit()
      return theClass
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number) {
    const theClass = await Class.query().where('id', id).firstOrFail()
    return await theClass.delete()
  }

  async myClass(teacherId: number) {
    const theClass = await Class.query().where('teacher_id', teacherId).firstOrFail()
    return theClass
  }
}
