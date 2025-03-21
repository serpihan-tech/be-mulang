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
            <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">
            <title>OTP</title>
            <style type="text/css">
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
                width: 387px; /* Sesuaikan dengan lebar header */
              }

              .header {
                width: 387px;
                background-color: blue;
                display: flex;
                justify-content: start;
                padding: 16px;
                position: relative;
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

              .triangle {
                width: 0;
                height: 0;
                border-top: 14px solid #03164B;
                border-left: 13px solid transparent;
                position: absolute;
                top: 72px;
                left: 0;
                z-index: 5;
              }

              .triangle2 {
                width: 0;
                height: 0;
                border-top: 14px solid #03164B;
                border-right: 13px solid transparent;
                position: absolute; /* Tambahkan positioning */
                top: 72px; /* Sesuaikan dengan tinggi header */
                right: -31px;
                z-index: 5;
              }

              .main-header {
                color: #000;
                font-size: 18px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
                text-align: left;
              }

              .main-container {
                width: 360px;
                margin-left: 13.5px;
                background-color: white;
                padding-right: 16px;
                padding-left: 16px;
                text-align: justify;
                color: #000;
                font-size: 14px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
                padding-top: 31px;
                padding-bottom: 80px;
              }

              .OTP {
                text-align: center;
                font-size: 35px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
              }

              .signature {
                text-align: right;
                font-family: Inter;
                font-size: 12px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
              }

              .sender {
                font-size: 12px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
              }

              .footer {
                width: 387px;
                background-color: blue;
                color: white;
                justify-content: start;
                padding: 16px;
              }

              .school-name {
                font-size: 14px;
                font-style: normal;
                font-weight: 700;
                line-height: normal;
                margin-bottom: 19px;
              }

              .contacts, .copyright {
                font-size: 12px;
                font-style: normal;
                font-weight: 400;
                line-height: normal;
                align-items: center;
              }

              .contact {
                display: flex;
                margin-bottom: 8px;
                align-items: center;
              }

              .call {
                padding-right: 14px;
              }

              .email {
                padding-right: 10px;
              }

              .copyright {
                display: flex;
                justify-content: right;
                margin-top: 19px;
                align-items: center;
              }

              .copyright-icon {
                margin-right: 10px;
              }

              @media screen and (max-width: 375px) {
                body {
                  transform-origin: center center;
                  transform: scale(0.9); /* Sesuaikan skala sesuai kebutuhan */
                }
              }

              @media screen and (max-width: 320px) {
                body {
                  transform: scale(0.8); /* Skala lebih kecil untuk layar yang sangat sempit */
                }
              }
            </style>
          </head>
          <body>
            <div>
              <header class="header">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <g clip-path="url(#clip0_1346_1671)">
                    <rect width="40" height="40" rx="15" fill="white"/>
                    <ellipse cx="20" cy="19.0625" rx="13" ry="12.5625" fill="#FFCF43"/>
                    <path d="M13.1022 24.5625C15.235 24.4303 16.4053 24.6068 18.4147 25.6875C19.2079 26.0235 19.5943 26.3324 20.2272 27C20.7411 26.3702 21.1011 26.0668 21.9772 25.6875C24.1458 24.2348 26.4999 24.8445 27.4147 24.5625C27.4471 24.5525 27.8254 23.7819 27.7897 23.25C27.7582 22.7797 27.3716 22.4798 27.3522 22.125C27.2034 21.3574 27.1757 20.7022 27.2897 18.875C27.3521 17.8386 27.3533 17.2769 27.2897 16.3125C27.2208 14.8828 26.9239 14.1761 26.1647 13C24.8902 11.656 24.1302 11.1058 22.6647 11C20.7902 11.017 19.8958 11.3221 18.6022 12.4375C18.1153 11.9568 17.8002 11.7681 17.0397 11.8125C16.4653 11.8537 15.8481 12.0191 15.2272 12.4375C14.1927 13.1345 13.9345 14.1318 13.6022 15.1875C13.4606 16.8421 13.4778 17.4701 13.4772 18.6875C13.5423 20.6873 13.1706 21.4938 12.3522 22.8125C12.213 23.203 12.2189 23.422 12.3522 23.8125C12.5903 24.2181 12.7691 24.3524 13.1022 24.5625Z" fill="#4B3A3A" stroke="#4B3A3A" stroke-width="0.125"/>
                    <path d="M17.5711 14.75C17.0068 16.8338 16.4519 17.6888 14.6336 18.125C14.5531 18.4027 14.5791 18.5718 14.6336 18.875C14.2564 18.6382 14.0565 18.5507 13.7586 18.625C13.3249 18.8362 13.2158 19.2309 13.2586 19.6875C13.3299 20.4462 13.7413 21.0839 14.5086 21.3125C14.8829 21.424 15.118 21.4223 15.5086 21.3125C16.3982 23.0741 17.1388 23.7086 18.8211 24.3125C18.6735 24.9487 18.5299 25.2428 18.1961 25.6875C19.0222 26.0354 19.4024 26.3459 20.0086 27C20.5486 26.3705 20.8998 26.057 21.7586 25.6875C21.4819 25.1699 21.3696 24.8696 21.2586 24.3125C22.8971 23.7524 23.6641 23.1145 24.6336 21.125C24.8531 21.5942 25.084 21.5078 25.5086 21.3125C26.0121 20.9883 26.2775 20.7635 26.6336 20.0625C26.8011 19.467 26.8393 19.1688 26.6336 18.8125C26.1455 18.4693 25.8718 18.5033 25.3836 18.8125V18.125C24.3443 17.85 23.6867 17.7139 22.1336 17.5625C19.2256 17.2335 18.2638 16.5923 17.5711 14.75Z" fill="#FFE0C1" stroke="#FEDFC0" stroke-width="0.125"/>
                    <circle cx="22.25" cy="19.125" r="0.75" fill="#4B3A3A"/>
                    <circle cx="17.75" cy="19.125" r="0.75" fill="#4B3A3A"/>
                    <ellipse cx="18" cy="18.9375" rx="0.25" ry="0.3125" fill="white"/>
                    <ellipse cx="22.5" cy="18.9375" rx="0.25" ry="0.3125" fill="white"/>
                    <path d="M21.375 21.3125C21.375 21.4356 21.3411 21.5575 21.2751 21.6713C21.2091 21.785 21.1125 21.8884 20.9906 21.9754C20.8687 22.0625 20.724 22.1315 20.5648 22.1786C20.4055 22.2258 20.2349 22.25 20.0625 22.25C19.8901 22.25 19.7195 22.2258 19.5602 22.1786C19.401 22.1315 19.2563 22.0625 19.1344 21.9754C19.0125 21.8884 18.9159 21.785 18.8499 21.6713C18.7839 21.5575 18.75 21.4356 18.75 21.3125L21.375 21.3125Z" fill="#D45E15"/>
                    <path d="M19.375 26.5C17.0269 24.9715 15.2044 24.7378 11.25 25.1875L11.6875 34.3125C15.1123 34.0059 16.7848 34.2424 19.375 35.3125V26.5Z" fill="#0736BC"/>
                    <path d="M11.5 25.0625L11.875 24C16.7187 24.0807 18.1333 24.8234 20 26.5H19.5625C17.4846 25.3241 16.277 24.6892 11.5 25.0625Z" fill="#0736BC"/>
                    <path d="M19.375 26.5C17.0269 24.9715 15.2044 24.7378 11.25 25.1875L11.6875 34.3125C15.1123 34.0059 16.7848 34.2424 19.375 35.3125V26.5Z" stroke="#0736BC" stroke-width="0.125"/>
                    <path d="M11.5 25.0625L11.875 24C16.7187 24.0807 18.1333 24.8234 20 26.5H19.5625C17.4846 25.3241 16.277 24.6892 11.5 25.0625Z" stroke="#0736BC" stroke-width="0.125"/>
                    <path d="M20.751 26.4506C23.0991 24.9221 24.9216 24.6884 28.876 25.1381L28.4385 34.2631C25.0137 33.9565 23.3411 34.193 20.751 35.2631V26.4506Z" fill="#0736BC"/>
                    <path d="M28.626 25.0131L28.3125 24.125C23.4689 24.2056 22.0542 24.9484 20.1875 26.625L20.5635 26.4506C22.6414 25.2747 23.849 24.6398 28.626 25.0131Z" fill="#0736BC"/>
                    <path d="M20.751 26.4506C23.0991 24.9221 24.9216 24.6884 28.876 25.1381L28.4385 34.2631C25.0137 33.9565 23.3411 34.193 20.751 35.2631V26.4506Z" stroke="#0736BC" stroke-width="0.125"/>
                    <path d="M28.626 25.0131L28.3125 24.125C23.4689 24.2056 22.0542 24.9484 20.1875 26.625L20.5635 26.4506C22.6414 25.2747 23.849 24.6398 28.626 25.0131Z" stroke="#0736BC" stroke-width="0.125"/>
                    <rect x="19.4375" y="26.5" width="1.25" height="8.875" fill="#03164B"/>
                    <path d="M11.5625 24.9615L11.9361 24C15.7966 24.0216 17.7768 24.2769 19.9693 26.5H20.2807C21.889 24.9022 22.8769 24.0427 28.3139 24.0641L28.6875 24.9615C24.9837 24.5824 23.2604 25.0382 20.5298 26.5H20.2807H19.9693H19.5957C17.1315 24.8682 15.2638 24.6982 11.5625 24.9615Z" fill="#FEFEFE" stroke="#FEFEFE" stroke-width="0.125"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1346_1671">
                      <rect width="40" height="40" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
              </header>
              <div class="triangle"></div>
              <main class="main-container">
                <header class="main-header">Halo! Melinda Wijaya</header>
                <p>Selamat datang di Mulang! Gunakan kode berikut untuk melanjutkan proses reset password aplikasi Mulang:</p>
                <p class="OTP">${this.otp}</p>
                <p>Kode ini berlaku selama <strong>10 menit</strong>. Masukkan kode tersebut pada halaman Mulang untuk menyelesaikan proses aktivasi atau login.</p>
                <p>Jika Anda tidak meminta kode ini, cukup abaikan email ini.</p>
                <div class="signature">
                  <span>Terima kasih,</span>
                  <div class="sender">Tim Mulang</div>
                </div>
              </main>
              <div class="triangle2"></div> 
              <footer class="footer">
                <div class="school-name">SMAN 81 Jakarta</div>
                <div class="contacts">
                  <div class="contact">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" class="call">
                      <path d="M9.82496 11.8417L7.09996 14.5667C6.79996 14.3001 6.50829 14.0251 6.22496 13.7417C5.36663 12.8751 4.59163 11.9667 3.89996 11.0167C3.21663 10.0667 2.66663 9.11675 2.26663 8.17508C1.86663 7.22508 1.66663 6.31675 1.66663 5.45008C1.66663 4.88341 1.76663 4.34175 1.96663 3.84175C2.16663 3.33341 2.48329 2.86675 2.92496 2.45008C3.45829 1.92508 4.04163 1.66675 4.65829 1.66675C4.89163 1.66675 5.12496 1.71675 5.33329 1.81675C5.54996 1.91675 5.74163 2.06675 5.89163 2.28341L7.82496 5.00841C7.97496 5.21675 8.08329 5.40841 8.15829 5.59175C8.23329 5.76675 8.27496 5.94175 8.27496 6.10008C8.27496 6.30008 8.21663 6.50008 8.09996 6.69175C7.99163 6.88341 7.83329 7.08341 7.63329 7.28341L6.99996 7.94175C6.90829 8.03341 6.86663 8.14175 6.86663 8.27508C6.86663 8.34175 6.87496 8.40008 6.89163 8.46675C6.91663 8.53341 6.94163 8.58341 6.95829 8.63341C7.10829 8.90841 7.36663 9.26675 7.73329 9.70008C8.10829 10.1334 8.50829 10.5751 8.94163 11.0167C9.24163 11.3084 9.53329 11.5917 9.82496 11.8417Z" fill="white"/>
                      <path d="M18.3083 15.275C18.3083 15.5083 18.2667 15.75 18.1833 15.9833C18.1583 16.05 18.1333 16.1166 18.1 16.1833C17.9583 16.4833 17.775 16.7666 17.5333 17.0333C17.125 17.4833 16.675 17.8083 16.1667 18.0166C16.1583 18.0166 16.15 18.025 16.1417 18.025C15.65 18.225 15.1167 18.3333 14.5417 18.3333C13.6917 18.3333 12.7833 18.1333 11.825 17.725C10.8667 17.3166 9.90833 16.7666 8.95833 16.075C8.63333 15.8333 8.30833 15.5916 8 15.3333L10.725 12.6083C10.9583 12.7833 11.1667 12.9166 11.3417 13.0083C11.3833 13.025 11.4333 13.05 11.4917 13.075C11.5583 13.1 11.625 13.1083 11.7 13.1083C11.8417 13.1083 11.95 13.0583 12.0417 12.9666L12.675 12.3416C12.8833 12.1333 13.0833 11.975 13.275 11.875C13.4667 11.7583 13.6583 11.7 13.8667 11.7C14.025 11.7 14.1917 11.7333 14.375 11.8083C14.5583 11.8833 14.75 11.9916 14.9583 12.1333L17.7167 14.0916C17.9333 14.2416 18.0833 14.4166 18.175 14.625C18.2583 14.8333 18.3083 15.0416 18.3083 15.275Z" fill="white"/>
                    </svg>
                    <div>(021) 1234-5678</div>
                  </div>
                  <div class="contact">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="email">
                      <path d="M17 20.5H7C4 20.5 2 19 2 15.5V8.5C2 5 4 3.5 7 3.5H17C20 3.5 22 5 22 8.5V15.5C22 19 20 20.5 17 20.5Z" fill="white"/>
                      <path d="M12 12.87C11.16 12.87 10.31 12.61 9.66003 12.08L6.53002 9.57997C6.21002 9.31997 6.15003 8.84997 6.41003 8.52997C6.67003 8.20997 7.14003 8.14997 7.46003 8.40997L10.59 10.91C11.35 11.52 12.64 11.52 13.4 10.91L16.53 8.40997C16.85 8.14997 17.33 8.19997 17.58 8.52997C17.84 8.84997 17.79 9.32997 17.46 9.57997L14.33 12.08C13.69 12.61 12.84 12.87 12 12.87Z" fill="#0841E2"/>
                    </svg>
                    <div>support@mulang.sch.id</div>
                  </div>
                  <div>Jalan Pendidikan No. 45, Kecamatan Cerdas, Kota Ilmu, Provinsi Nusantara, 12345</div class="address">
                </div>
                <div class="copyright">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none" class="copyright-icon">
                    <path d="M9 16.5C4.86 16.5 1.5 13.14 1.5 9C1.5 4.86 4.86 1.5 9 1.5C13.14 1.5 16.5 4.86 16.5 9C16.5 13.14 13.14 16.5 9 16.5Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.1599 11.25C10.6274 11.715 9.93743 12 9.17993 12C7.52243 12 6.17993 10.6575 6.17993 9C6.17993 7.3425 7.52243 6 9.17993 6C9.93743 6 10.6274 6.285 11.1599 6.75" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
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
