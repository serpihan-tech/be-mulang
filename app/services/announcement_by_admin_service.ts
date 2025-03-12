import AnnouncementByAdmin from '#models/announcement_by_admin'
import { AnnouncementByAdminContract } from '../contracts/announcement_contract.js'

export class AnnouncementByAdminService implements AnnouncementByAdminContract {
  async getAll(page: number, limit?: number, data?: any): Promise<any> {
    const perPage: number = limit || 10
    return await AnnouncementByAdmin.filter(data).preload('admin').paginate(page, perPage)
  }

  async getOne(id: number): Promise<any> {
    throw new Error('Method not implemented.')
  }

  async create(data: any): Promise<Object> {
    throw new Error('Method not implemented.')
  }

  async update(id: number, data: any): Promise<Object> {
    throw new Error('Method not implemented.')
  }

  async delete(id: number): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
