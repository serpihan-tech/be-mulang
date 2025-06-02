/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'
import ResetPasswordENotification from '#mails/reset_password_e_notification'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash'
import { randomBytes } from 'node:crypto'
import { passwordValidator } from '#validators/user'
import limiter from '@adonisjs/limiter/services/main'
import Admin from '#models/admin'

export default class ResetPasswordController {
  async sendOtp({ request, response }: HttpContext) {
    const { email } = request.only(['email'])
    
    const key = `user_${request.ip()}_${email}`

    const sendOtpLimiter = limiter.use({
      requests:  1,
      duration: '1 minute',
      blockDuration: '1 minute'
    })

    let user
    let admin

    const executed = await sendOtpLimiter.attempt(key, async () => {
      // Find User by Email
      user = await User.query().where('email', email).firstOrFail()

      const roleUser = await User.getRole(user)
  
      if ( roleUser.role === 'teacher' ) {
        await user.load('teacher')
      } else if ( roleUser.role === 'student' ) {
        await user.load('student')
      } else if ( roleUser.role === 'admin' ) {
        await user.load('admin')
      }

      const availableIn = await sendOtpLimiter.availableIn(key)
      const exp = `${Math.ceil(availableIn / 60)} menit`

      admin = await Admin.query().where('id', 1).preload('user').firstOrFail()

      if (!user) {
        return response.badRequest({ error: { message: 'Email Tidak Ditemukan' } })
      }
    
      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000)
      user.otp = otp
      user.otp_created_at = DateTime.now().setZone('Asia/Jakarta')
    
      // Save user (Database)
      await user.save()
    
      // Send Email (Async)
      mail.send(new ResetPasswordENotification(user, otp, admin, exp)).catch(console.error)

      return true
    })
    
    /**
     * Notify users that they have exceeded the limit
     */
    if (!executed) {
      const availableIn = await sendOtpLimiter.availableIn(key)
      return response.tooManyRequests({
        error: {
          message: `Terlalu Banyak Permintaan Kode OTP, Ulangi Lagi dalam ${availableIn} detik`,
          code: 'E_TOO_MANY_REQUESTS',
          status: 429,
          availableIn: availableIn
        },
      })
    }

    return {
      message: 'OTP Berhasil Dikirim, Check Email Anda Secara Berkala!',
      email: user!.email,
    }
  }
  

  async verifyOtp({ request, response }: HttpContext) {
    const { email, otp } = request.only(['email', 'otp'])
  
    const user = await User.findBy('email', email)
  
    if (!user) {
      return response.badRequest({ error: { message: 'Email Tidak Ditemukan' } }) // return 400
    }
  
    if (!user.otp_created_at) {
      return response.badRequest({ error: { message: 'OTP Tidak Ditemukan atau Sudah Kadaluwarsa' } }) // return 400
    }
  
    const otpCreatedAt = DateTime.fromISO(user.otp_created_at.toISO() ?? '') // ✅ Fix: Pastikan nilai tidak null
  
    // set TIMEZONE to WIB (Jakarta) and calculate the difference in minutes
    const diffMinutes = DateTime.now().setZone('Asia/Jakarta').diff(otpCreatedAt, 'minutes').minutes
  
    // console.log('Diff in Minutes:', diffMinutes)
  
    // if the otp is valid and not expired (Change to 5 Minutes Expire)
    if (String(user.otp) === String(otp) && Math.floor(diffMinutes) < 30) { 
      user.otp = null
      user.otp_created_at = null
  
      const randomStr = await hash.make(randomBytes(32).toString('hex'))
      user.reset_token = randomStr
      await user.save()
  
      return {
        message: 'OTP Valid',
        resetToken: user.reset_token,
      }
    } else {
      user.otp = null
      user.otp_created_at = null
      return response.badRequest({ error: { message: 'OTP Tidak Valid atau Kadaluwarsa, Ulangi Proses!' } }) // return 400
    }
  }
  

  async resetPassword({ request, response }: HttpContext) {
    const { email, password, resetToken } = request.only(['email', 'password', 'resetToken'])

    const user = await User.findBy('email', email)

    if (!user) {
      return response.badRequest({ error: { message: 'Email Tidak Ditemukan' } })
    }
    
    if(resetToken === user!.reset_token){
      await passwordValidator.validate({ password })

      user!.password = password
      user!.reset_token = null

      await user!.save()

      return response.accepted({ message: 'Password Berhasil Direset!' })
    } else {
      return response.badRequest({error:{ message: 'Reset Token Salah!' }}) // For Frontend, Not Shown on Client/End User
    }
  }
}
