import SchoolCalendar from '#models/school_calendar'
import SchoolCalendarContract from '../contracts/school_calendar_contract.js'

export class SchoolCalendarService implements SchoolCalendarContract {
  async getAll(params: any): Promise<any> {
    const sortBy = params.sortBy
    const sortOrder = params.sortOrder

    const sc = SchoolCalendar.query()
      .if(params.search, (query) =>
        query
          .where('description', 'like', `%${params.search}%`)
          .orWhere('date_start', 'like', `%${params.search}%`)
          .orWhere('date_end', 'like', `%${params.search}%`)
      )
      .if(sortBy === 'deskripsi', (qs) => qs.orderBy('description', sortOrder || 'asc'))
      .if(sortBy === 'tanggalMulai', (qs) => qs.orderBy('date_start', sortOrder || 'asc'))
      .if(sortBy === 'tanggalSelesai', (qs) => qs.orderBy('date_end', sortOrder || 'asc'))

    if (params.noPaginate) {
      return await sc
    } else {
      return await sc.paginate(Number(params.page) || 1, Number(params.limit) || 10)
    }
  }
  async getOne(id: number): Promise<Object> {
    const sc = await SchoolCalendar.query().where('id', id).firstOrFail()

    return sc
  }
  async create(data: any): Promise<Object> {
    const sc = await SchoolCalendar.create(data)

    return sc
  }
  async update(id: number, data: any): Promise<Object> {
    const sc = await SchoolCalendar.query().where('id', id).firstOrFail()
    sc.merge(data)

    return await sc.save()
  }
  async delete(id: number): Promise<void> {
    const sc = await SchoolCalendar.query().where('id', id).firstOrFail()
    return await sc.delete()
  }
}
