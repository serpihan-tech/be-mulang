import Class from '#models/class'
import { createClassValidator, updateClassValidator } from '#validators/class'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { inject } from '@adonisjs/core'
import { ClassService } from '#services/class_service'
import { messages } from '../utils/validation_message.js'

@inject()
export default class ClassesController {
  constructor(private classService: ClassService) { }
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 2)
    try {
      const classes = await this.classService.get(['id', 'name'], page, limit)
      
      return response.ok({ 
        status: true,
        code: 200,
        data: classes 
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

  async create({ }: HttpContext) {
  }
  
  async store ({  request, response }: HttpContext) {
    try {
      await createClassValidator.validate(request.all())
      const classes = await this.classService.create(request.all())
      return response.created({
        message: 'Kelas Berhasil Ditambahkan',
        data: classes
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const classId: number = params.id
      const classes = await db.from('classes').where('id', classId).select('id', 'name')
      return response.ok({ 
        messages: "berhasil ditampilkan",
        data: classes 
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

  async edit({ params, request, response }: HttpContext) {
    const id:number = params.classId
    try {
      await updateClassValidator.validate(request.all())
      const theClass = await this.classService.update(request.all(), id)
      return response.ok({
        messages: 'Kelas Berhasil Diubah',
        theClass
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }
  
  async update({  }: HttpContext) {  }

  async destroy({ params, response }: HttpContext) {
    try {
      const classId:number = params.id
      await this.classService.delete(classId)
      return response.ok({ 
        message: 'Kelas Berhasil Dihapus' 
      })
    } catch (error) {
      return response.status(400).send({
        error: {
          message: error.message || "Terjadi kesalahan pada server"
        }
      })
    }
  }

}