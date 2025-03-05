import Class from '#models/class'
import { createClassValidator } from '#validators/class'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class ClassesController {
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 2)
    const classes = await db.from('classes').select('id', 'name').paginate(page, limit)
    return response.ok({ 
      status: true,
      code: 200,
      data: classes 
    })
  }

  async create({ }: HttpContext) {
  }
  
  async store ({  request, response }: HttpContext) {
    const classes = new Class()
    classes.name = request.input('name')
    classes.teacher_id = request.input('teacher_id')
    await createClassValidator.validate(classes)
    
    const teacherList = await db.from('teachers').select('id').where('id', classes.teacher_id)
    if (teacherList.length === 0) {
      return response.badRequest({ error: { message: 'Guru Tidak Ditemukan' } })
    }
    
    await classes.save()
    
    return response.created({
      status: true,
      code: 200,
      message: 'Kelas Berhasil Ditambahkan',
      data: classes
    })
  }

  async show({ params, response }: HttpContext) {
    const classId: number = params.id
    const classes = await db.from('classes').where('id', classId).select('id', 'name')
    return response.ok({ 
      status: true,
      code: 200,
      data: classes 
    })
  }

  async edit({ params, request }: HttpContext) {
    const id:number = params.classId
    const classes = await Class.findOrFail(id)
    try {
      classes.name = request.input('name')
      classes.teacher_id = request.input('teacher_id')
      await createClassValidator.validate(classes)

      await classes.save()
      
      return {
        messages: "berhasil diubah",
      }
    } catch (error) {
      
    }
    
    
  }
  
  async update({  }: HttpContext) {  }

  async destroy({ params }: HttpContext) {
    const classId:number = params.id
    await db.from('classes').where('id', classId).delete()
    return { message: 'Kelas Berhasil Dihapus' }
  }

}