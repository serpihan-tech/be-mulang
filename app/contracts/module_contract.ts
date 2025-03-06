export default interface ModuleContract {
  get(columns?:string[], id?:number):Promise<any>

  create(data:any):Promise<any>

  update(id:any, data:any):Promise<any>

  delete(id:number):Promise<any>

  getByFilter(filter:any, columns?:string[]):Promise<any>
}