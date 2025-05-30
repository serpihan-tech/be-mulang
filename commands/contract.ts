import { BaseCommand, args } from '@adonisjs/core/ace'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

export default class CreateContractCommand extends BaseCommand {
  static commandName = 'make:contract'
  static description = 'Create a new contract file inside the contracts directory'

  @args.string({ description: 'Name of the contract file (without extension)' })
  declare filename: string

  async run() {
    try {
      const formattedName = this.filename.toLowerCase() + '_contract.ts'
      const className = this.filename.charAt(0).toUpperCase() + this.filename.slice(1) + 'Contract'
      const filePath = join(fileURLToPath(this.app.appRoot), 'app/contracts', formattedName)

      const template = `
export default interface ${className} {
  
}`

      await writeFile(filePath, template, 'utf-8')
      this.logger.success(`Contract file created: ${filePath}`)
    } catch (error) {
      this.logger.error(`Failed to create contract file: ${error.message}`)
      this.exitCode = 1
    }
  }
}
