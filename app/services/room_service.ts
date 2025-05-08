import Room from '#models/room'

export default class RoomService {
  async getAll(params: any) {
    const rooms = await Room.query()
      .if(params.sortBy === 'id', (qs) => qs.orderBy('id', params.sortOrder || 'asc'))
      .if(params.sortBy === 'nama', (qs) => qs.orderBy('name', params.sortOrder || 'asc'))
      .if(params.search, (qs) => qs.where('name', 'like', `%${params.search}%`))

      .paginate(Number(params.page || 1), Number(params.limit || 10))

    return rooms
  }

  async getOne(roomId: number) {
    const room = await Room.query().where('id', roomId).firstOrFail()

    return room
  }

  async create(data: any) {
    const room = await Room.create(data)

    return room
  }

  async update(roomId: number, data: any) {
    const room = await Room.query().where('id', roomId).firstOrFail()

    await room.merge(data).save()

    return room
  }

  async delete(roomId: number) {
    const room = await Room.query().where('id', roomId).firstOrFail()
    const name = room.name

    await room.delete()

    return name
  }

  async listNames(params: any) {
    const rooms = await Room.query()
      .select('id', 'name')
      .if(params.sortBy === 'id', (qs) => qs.orderBy('id', params.sortOrder || 'asc'))
      .if(params.sortBy === 'nama', (qs) => qs.orderBy('name', params.sortOrder || 'asc'))

    return rooms
  }
}
