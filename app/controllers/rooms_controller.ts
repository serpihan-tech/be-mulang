import type { HttpContext } from '@adonisjs/core/http'
import RoomService from '#services/room_service'
import { inject } from '@adonisjs/core'
import { createRoomValidator, updateRoomValidator } from '#validators/room'

@inject()
export default class RoomsController {
  constructor(private roomService: RoomService) {}

  async index({ request, response }: HttpContext) {
    try {
      const rooms = await this.roomService.getAll(request.all())

      return response.ok({ message: 'Berhasil Mendapatkan Data Ruangan', rooms })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const room = await this.roomService.getOne(params.id)

      return response.ok({ message: 'Berhasil Mendapatkan Data Ruangan', room })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Ruangan Tidak Ditemukan' } })

      return response.badRequest({ error: { message: error.message } })
    }
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()

      await createRoomValidator.validate(data)

      const room = await this.roomService.create(data)

      return response.created({ message: 'Data Ruangan Berhasil Ditambahkan', room })
    } catch (error) {
      return response.badRequest({ error })
    }
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()

      await updateRoomValidator.validate(data)

      const room = await this.roomService.update(params.id, data)

      return response.ok({ message: 'Data Ruangan Berhasil Diubah', room })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Ruangan Tidak Ditemukan' } })

      return response.badRequest({ error })
    }
  }

  async destroy({ params, response }: HttpContext) {
    try {
      const room = await this.roomService.delete(params.id)

      return response.ok({ message: `Ruangan ${room} Berhasil Dihapus` })
    } catch (error) {
      if (error.code === 'E_ROW_NOT_FOUND')
        return response.notFound({ error: { message: 'ID Ruangan Tidak Ditemukan' } })

      return response.badRequest({ error: { message: error.message } })
    }
  }

  async listRooms({ request, response }: HttpContext) {
    try {
      const rooms = await this.roomService.listNames(request.all())

      return response.ok({ message: 'Berhasil Mendapatkan Data Ruangan', rooms })
    } catch (error) {
      return response.badRequest({ error: { message: error.message } })
    }
  }
}
