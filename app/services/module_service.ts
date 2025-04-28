import db from '@adonisjs/lucid/services/db'
import Module from '#models/module'
import ModuleContract from '../contracts/module_contract.js'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class ModuleService implements ModuleContract {
  async getAll(params: any): Promise<any> {
    const dataModule = await Module.query()

      .if(params.search && params.search.trim() !== '', (query) => {
        const search = params.search.trim()
        query.where((q) => {
          q.where('modules.name', 'like', `%${search}%`)
            .orWhereHas('teacher', (teacherQuery) => {
              teacherQuery.where('name', 'like', `%${search}%`)
            })
            .orWhereHas('academicYear', (ay) => ay.where('name', 'like', `%${search}%`))
        })
      })

      .if(params.namaMapel, (query) => {
        query.where('name', params.namaMapel)
      })

      .if(params.tahunAjar, (query) => {
        query.whereHas('academicYear', (ayQuery) => {
          ayQuery.where('id', params.tahunAjar)
        })
      })

      .if(params.nip, (query) => {
        query.whereHas('teacher', (tQuery) => {
          tQuery.where('nip', params.nip)
        })
      })

      .if(params.sortBy === 'mapel', (query) => {
        query.orderBy('modules.name', params.sortOrder || 'asc')
      })
      .if(params.sortBy === 'tahunAjar', (query) => {
        query
          .join('academic_years', 'modules.academic_year_id', 'academic_years.id')
          .orderBy('academic_years.name', params.sortOrder || 'asc')
          .select('modules.*')
      })
      .if(params.sortBy === 'guru', (query) => {
        query
          .join('teachers', 'modules.teacher_id', 'teachers.id')
          .orderBy('teachers.name', params.sortOrder || 'asc')
          .select('modules.*')
      })

      .preload('academicYear', (ay) =>
        ay.select('id', 'name', 'dateStart', 'dateEnd', 'semester', 'status')
      )
      .preload('teacher', (t) => t.select('id', 'name', 'nip'))

      .paginate(params.page || 1, params.limit || 10)

    return dataModule
  }

  async getOne(id: any): Promise<any> {
    const module = await Module.query().where('id', id).firstOrFail()

    return module
  }

  async create(data: any): Promise<any> {
    if (data.name && data.academic_year_id && data.teacher_id) {
      const module = await Module.query()
        .where('name', data.name)
        .where('academic_year_id', data.academic_year_id)

      for (const m of module) {
        if (
          m.teacherId === data.teacher_id &&
          m.academicYearId === data.academic_year_id &&
          m.name === data.name
        ) {
          throw new Error('Mapel sudah ada')
        }
      }
    }

    const modules = await Module.create({
      name: data.name,
      academicYearId: data.academic_year_id,
      teacherId: data.teacher_id,
    })

    console.log(data)
    if (data.thumbnail) {
      const tn = data.thumbnail
      console.log(tn)
      const fileName = `${tn.clientName}`

      // Pindahkan file hanya jika `profile_picture` ada dan valid
      await tn.move(app.makePath('storage/uploads/modules-thumbnail'), {
        name: fileName,
        overwrite: true,
      })

      // Simpan path file ke dalam database
      modules.thumbnail = `modules-thumbnail/${fileName}`
    }

    await modules.save()

    return modules
  }

  async update(data: any, id: number): Promise<any> {
    const modules = await Module.findOrFail(id)
    modules.merge({
      name: data.name ?? modules.name,
      academicYearId: data.academic_year_id ?? modules.academicYearId,
      teacherId: data.teacher_id ?? modules.teacherId,
    })

    if (data.thumbnail) {
      const tn = data.thumbnail
      console.log(tn)
      const fileName = `${tn.clientName}`

      // Pindahkan file hanya jika `profile_picture` ada dan valid
      await tn.move(app.makePath('storage/uploads/modules-thumbnail'), {
        name: fileName,
      })

      // Simpan path file ke dalam database
      modules.thumbnail = `modules-thumbnail/${fileName}`
    }

    await modules.save()

    return modules
  }

  async delete(id: number): Promise<any> {
    const modules = await Module.findOrFail(id)
    const name = modules.name
    await modules.delete()

    return name
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

  async getAllNames(data: any) {
    // only return module's name
    const academicYear = await this.getActiveSemester()

    const modules = await Module.query()
      .where('academic_year_id', data.tahunAjar ?? academicYear.id)
      .orderBy('name', 'asc')
      .distinct('name')

    return modules
  }

  async listModules(params: any) {
    // return module's name and teacher's
    const activeAcademicYear = await this.getActiveSemester()
    const yearId = params.tahunAjar ?? activeAcademicYear.id

    const modules = await Module.query()
      .select('id', 'name', 'academic_year_id', 'teacher_id')
      .where('academic_year_id', yearId)
      .preload('teacher', (t) => t.select('id', 'name'))

    return modules
  }
}
