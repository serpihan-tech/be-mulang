import type { HttpContext } from '@adonisjs/core/http'
import sharp from 'sharp'
import fs from 'node:fs/promises'

export default class CompressImageMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const { request } = ctx
    const fields = ['in_photo', 'out_photo']

    for (const field of fields) {
      const file = request.file(field)
      if (file && file.tmpPath) {
        const originalPath = file.tmpPath
        const ext = file.extname
        const compressedPath = `${originalPath}-compressed.${ext}`

        await sharp(originalPath)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toFile(compressedPath)

        // Ganti tmpPath ke file hasil kompresi
        file.tmpPath = compressedPath

        await fs.unlink(originalPath).catch(() => {})
      }
    }

    await next()
  }
}
