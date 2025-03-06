export default interface ScoreContract {
  get(columns?: string[], id?: number): Promise<any>
  create(data: any): Promise<any>
  update(data: any, id: any): Promise<any>
  delete(id: number): Promise<any>
}