import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  prettyPrintDebugQueries: true,
  connection: 'mysql',
  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
        timezone: 'Asia/Jakarta', // ! Menimbulkan warning MySQL akan tidak support di versi mendatang, figure it out!
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      seeders: {
        paths: ['./database/seeders/MainSeeder'],
      },
      debug: true,
    },
  },
})

export default dbConfig
