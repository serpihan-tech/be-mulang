/* eslint-disable prettier/prettier */
import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { DateTime } from 'luxon'
import ResetPasswordENotification from '#mails/reset_password_e_notification'
import mail from '@adonisjs/mail/services/main'
import hash from '@adonisjs/core/services/hash'
import { randomBytes } from 'node:crypto'

export default class ResetPasswordController {
  async sendOtp({ request, response }: HttpContext) {
    const { email } = request.only(['email'])

    // Find User by Email (WHERE)
    const user = await User.findBy('email', email)

    // if the user exists...
    if (user!) {
      // create 6 digits number for otpr
      const otp = Math.floor(1000 + Math.random() * 9000)
      user.otp = otp
      
      // set TIMEZONE to WIB (Jakarta)
      user.otp_created_at = DateTime.now().setZone('Asia/Jakarta')

      await user.save()

      // Send the email for OTP
      await mail.send(new ResetPasswordENotification(user, otp))

      return {
        message: 'OTP Berhasil Dikirim, Check Email Anda!',
        email: user.email,
      }
    } else {
      return response.badRequest({ message: 'Email Tidak Ditemukan' }) // return 400
    }
  }

  async verifyOtp({ request, response }: HttpContext) {
    const { email, otp } = request.only(['email', 'otp'])

    const user = await User.findBy('email', email)

    if (!user) {
      return response.badRequest({ message: 'Email Tidak Ditemukan' }) // return 400
    }

    console.log('Stored OTP:', user!.otp)
    console.log('Stored OTP Created At:', user!.otp_created_at!.toString())
    console.log('Current Time:', DateTime.now().toString())

    const otpCreatedAt = DateTime.fromISO(user!.otp_created_at!.toString())
    // set TIMEZONE to WIB (Jakarta) and calculate the difference in minutes
    const diffMinutes = DateTime.now().setZone('Asia/Jakarta').diff(otpCreatedAt, 'minutes').minutes

    console.log('Diff in Minutes:', diffMinutes)

    // if the otp is valid and not expired (Less than 10 minutes old)
    // TODO : Change to 5 Minutes Expire
    if (String(user!.otp) === String(otp) && Math.floor(diffMinutes) < 30) { 
      user!.otp = null
      user!.otp_created_at = null
      
      const randomStr = await hash.make(randomBytes(32).toString('hex'))
      user!.reset_token = randomStr
      await user!.save()

      return {
        message: 'OTP Valid',
        resetToken: user!.reset_token,
      }
    } else {
      return response.badRequest({ message: 'OTP Tidak Valid atau Kadaluwarsa, Ulangi Proses!' }) // return 400
    }
  }

  async resetPassword({ request, response }: HttpContext) {
    const { email, password, resetToken } = request.only(['email', 'password', 'resetToken'])

    const user = await User.findBy('email', email)

    if (user!) {
      if(resetToken === user!.reset_token){
        user!.password = password
        user!.reset_token = null

        await user!.save()

        return response.accepted({ message: 'Password Berhasil Direset!' })
      } else {
        return response.badRequest({ message: 'Reset Token Salah!' }) // For Frontend, Not Shown on Client/End User
      }
    } else {
      return response.badRequest({ message: 'Email Tidak Ditemukan' }) // return 400
    }
  }
}
