/* eslint-disable prettier/prettier */
import { BaseMail } from '@adonisjs/mail'
import User from '#models/user'
import Env from '#start/env'
import Admin from '#models/admin'
// import router from '@adonisjs/core/services/router'

export default class ResetPasswordENotification extends BaseMail {
  from = ''
  subject = ''

  constructor(
    private user: User,
    private otp: number,
    private admin: Admin,
    private expireIn: string
    // private token: string
  ) {
    super()
    console.log(this.user)
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
      .from(Env.get('SMTP_USERNAME')?.toString() || '')
      .to(this.user.email)
      .subject('Reset Password Mulang')
    //   .html(`
    //     <div style="
    //       font-family: Arial, sans-serif;
    //       max-width: 480px;
    //       margin: auto;
    //       padding: 24px;
    //       background: linear-gradient(135deg, #ffffff, #f3f4f6);
    //       border-radius: 14px;
    //       text-align: center;
    //       box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.1);
    //       border: 1px solid #e0e0e0;
    //     ">
    //       <h2 style="color: #222; font-size: 22px; margin-bottom: 10px;">🔐 Kode OTP Keamanan</h2>
    //       <p style="font-size: 15px; color: #555;">Gunakan kode di bawah ini untuk reset password email Anda:</p>

    //       <div style="
    //         font-size: 36px;
    //         font-weight: bold;
    //         color: #fff;
    //         background: #1e3a8a;
    //         display: inline-block;
    //         padding: 14px 24px;
    //         border-radius: 10px;
    //         margin: 18px 0;
    //         letter-spacing: 3px;
    //         box-shadow: inset 0px -2px 6px rgba(0, 0, 0, 0.2);
    //       ">
    //         ${this.otp}
    //       </div>

    //       <p style="font-size: 14px; color: #666;">Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kepada siapa pun.</p>

    //       <div style="margin-top: 20px;">
    //         <p style="font-size: 12px; color: #888;">Butuh bantuan? <a href="https://www.instagram.com/serpihantech/" style="color: #2563eb; text-decoration: none;">Hubungi Dukungan</a></p>
    //         <p style="font-size: 12px; color: #aaa;">&copy; ${new Date().getFullYear()} Mulang. Seluruh hak cipta dilindungi.</p>
    //       </div>
    //     </div>
    // `)
    .html(`<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
            <title>OTP</title>
            <style type="text/css">
              * {
                box-sizing: border-box;
              }

              body {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 0;
                font-family: 'Inter', sans-serif;
                background-color: #f0f0f0;
                min-height: 100vh;
                position: relative;
              }

              body > div {
                position: relative;
                max-width: 400px;
                width: 100%;
              }

              .header {
                background-color: blue;
                display: flex;
                justify-content: start;
                padding: 16px;
              }

              .logo-bg {
                width: 40px;
                height: 40px;
                background-color: white;
                border-radius: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .logo {
                width: 26px;
              }

              .main-header {
                color: #000;
                font-size: 18px;
                font-weight: 700;
                text-align: left;
              }

              .main-container {
                background-color: white;
                padding: 16px;
                color: #000;
                font-size: 14px;
                line-height: 1.6;
              }

              .OTP {
                text-align: center;
                font-size: 35px;
                font-weight: 700;
              }

              .signature {
                text-align: right;
                font-size: 12px;
              }

              .sender {
                font-weight: 700;
              }

              .footer {
                background-color: blue;
                color: white;
                padding: 16px;
              }

              .school-name {
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 12px;
              }

              .contacts, .copyright {
                font-size: 12px;
              }

              .contact {
                display: flex;
                margin-bottom: 8px;
                align-items: center;
              }

              .call {
                padding-right: 10px;
              }

              .email {
                padding-right: 10px;
              }

              .copyright {
                display: flex;
                justify-content: right;
                margin-top: 12px;
              }

              .copyright-icon {
                margin-right: 8px;
              }

              @media screen and (max-width: 375px) {
                body {
                  transform-origin: center center;
                  transform: scale(0.9);
                }
              }

              @media screen and (max-width: 320px) {
                body {
                  transform: scale(0.8);
                }
              }
            </style>
          </head>
          <body>
            <div>
              <header class="header">
                <!-- SVG content -->
              </header>
              <main class="main-container">
                <header class="main-header">Halo! ${this.user.student?.name ?? this.user.teacher.name}</header>
                <p>Selamat datang di Mulang! Gunakan kode berikut untuk melanjutkan proses reset password aplikasi Mulang:</p>
                <p class="OTP">${this.otp}</p>
                <p>Kode ini berlaku selama <strong>${this.expireIn}</strong>. Masukkan kode tersebut pada halaman Mulang untuk menyelesaikan proses aktivasi, login, atau reset password.</p>
                <p>Jika Anda tidak meminta kode ini, cukup abaikan email ini.</p>
                <div class="signature">
                  <span>Terima kasih,</span>
                  <div class="sender">Tim Mulang</div>
                </div>
              </main>
              <footer class="footer">
                <div class="school-name">${this.admin.name ?? Env.get('SCHOOL_NAME')}</div>
                <div class="contacts">
                  <div class="contact">
                    <!-- Call SVG content -->
                    <div>${ this.admin.phone ?? Env.get('SCHOOL_PHONE')}</div>
                  </div>
                  <div class="contact">
                    <!-- Email SVG content -->
                    <div>${this.admin.user.email ?? Env.get('SCHOOL_EMAIL')}</div>
                  </div>
                  <div>${this.admin.address ?? Env.get('SCHOOL_ADDRESS')}</div>
                </div>
                <div class="copyright">
                  <!-- Copyright SVG content -->
                  <div>2025. Mulang All Right reserved</div>
                </div>
              </footer>
            </div>
          </body>
          </html>
        `,
    )
  }
}
