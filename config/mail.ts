/* eslint-disable prettier/prettier */
import env from '#start/env'
import { defineConfig, transports } from '@adonisjs/mail'

const mailConfig = defineConfig({
  default: 'smtp',

   /**
    * The mailers object can be used to configure multiple mailers
    * each using a different transport or same transport with different
    * options.
   */
  mailers: { 
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'sandbox.smtp.mailtrap.io'), // Default Mailtrap
      port: env.get('SMTP_PORT'), // Default port Mailtrap
      auth: {
        type: 'login',
        user: env.get('SMTP_USERNAME', ''), // Pastikan selalu string
        pass: env.get('SMTP_PASSWORD', ''), // Pastikan selalu string
      },
      secure: true,
    }),
  },
})

export default mailConfig

declare module '@adonisjs/mail/types' {
  export interface MailersList extends InferMailers<typeof mailConfig> {}
}