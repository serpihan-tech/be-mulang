import db from '@adonisjs/lucid/services/db'
import Module from '#models/module'
import ModuleContract from '../contracts/module_contract.js'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

export default class ModuleService implements ModuleContract {
  async getAll(params: any): Promise<any> {
    const formatedParams = {
      name: params.namaMapel,
    }
    const dataModule = await Module.filter(formatedParams)
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

    if (data.thumbnail) {
      const tn = data.thumbnail
      console.log(tn)
      const fileName = `${cuid()}.${tn.extname}`

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

  async update(data: any, id: number): Promise<any> {
    const modules = await Module.findOrFail(id)
    modules.merge(data).save()

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
