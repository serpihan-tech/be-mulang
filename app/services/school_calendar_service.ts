import SchoolCalendar from '#models/school_calendar'
import SchoolCalendarContract from '../contracts/school_calendar_contract.js'

export class SchoolCalendarService implements SchoolCalendarContract {
  async getAll(): Promise<any> {
    const sc = await SchoolCalendar.all()

    return sc
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
