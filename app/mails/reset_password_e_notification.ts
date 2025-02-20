/* eslint-disable prettier/prettier */
import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'
// import Env from '#start/env'
// import router from '@adonisjs/core/services/router'

export default class ResetPasswordENotification extends BaseMail {
  from = ''
  subject = ''

  constructor(
    private user: User,
    private otp: number
    // private token: string
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  prepare() {
    // const domain: string = Env.get('DOMAIN') || 'http://localhost:3333'
    // const path: string = router.makeUrl('/reset-password/sendOtp')
    // const url: string = `${domain}${path}`

    this.message
      .from('noreply@mulang.co.id')
      .to(this.user.email)
      .subject('Reset Password Mulang')
      .html(`
        <div style="
          font-family: Arial, sans-serif;
          max-width: 480px;
          margin: auto;
          padding: 24px;
          background: linear-gradient(135deg, #ffffff, #f3f4f6);
          border-radius: 14px;
          text-align: center;
          box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        ">
          <h2 style="color: #222; font-size: 22px; margin-bottom: 10px;">🔐 Kode OTP Keamanan</h2>
          <p style="font-size: 15px; color: #555;">Gunakan kode di bawah ini untuk reset password email Anda:</p>

          <div style="
            font-size: 36px;
            font-weight: bold;
            color: #fff;
            background: #1e3a8a;
            display: inline-block;
            padding: 14px 24px;
            border-radius: 10px;
            margin: 18px 0;
            letter-spacing: 3px;
            box-shadow: inset 0px -2px 6px rgba(0, 0, 0, 0.2);
          ">
            ${this.otp}
          </div>

          <p style="font-size: 14px; color: #666;">Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kepada siapa pun.</p>

          <div style="margin-top: 20px;">
            <p style="font-size: 12px; color: #888;">Butuh bantuan? <a href="#" style="color: #2563eb; text-decoration: none;">Hubungi Dukungan</a></p>
            <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Mulang. Seluruh hak cipta dilindungi.</p>
          </div>
        </div>
    `)
  }
}
