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

        // Ukuran file asli (sebelum kompresi)
        const originalStat = await fs.stat(originalPath)
        const originalSizeMB = originalStat.size / 1024 / 1024
        console.log(`File ${field} size BEFORE compression: ${originalSizeMB.toFixed(2)} MB`)

        // Proses kompresi
        await sharp(originalPath)
          .resize({ width: 800, withoutEnlargement: true })
          .jpeg({ quality: 90 })
          .toFile(compressedPath)

        // Ukuran file hasil kompresi
        const compressedStat = await fs.stat(compressedPath)
        const compressedSizeMB = compressedStat.size / 1024 / 1024
        console.log(`File ${field} size AFTER compression: ${compressedSizeMB.toFixed(2)} MB`)

        // Ganti tmpPath ke file hasil kompresi
        file.tmpPath = compressedPath

        // Hapus file asli
        await fs.unlink(originalPath).catch(() => {})
      }
    }

    await next()
  }
}
