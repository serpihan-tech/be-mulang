import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { createUserValidator } from '#validators/user'

export default class UsersController {
  async index({ }: HttpContext) {
    return "hello"
  }
  async create({ request }: HttpContext) {
    const user = new User()
    user.username = request.input('username')
    user.email = request.input('email')
    user.password = request.input('password')


    await createUserValidator.validate(user)
    await user.save()

    return user
  }

  async login({ request, auth }: HttpContext) {
    const { email, password, username } = request.only(['email', 'password', 'username'])

    if(!username){
      const user = await User.verifyCredentials(email, password)
      const token = await User.accessTokens.create(user)
  
      return {
        user: user,
        token: token
      }
    }
    if(!email){
      const user = await User.verifyCredentials(username, password)
      const token = await User.accessTokens.create(user)
  
      return {
        user: user,
        token: token
      }
    }
  }

  async logout({ response, auth }:HttpContext){
    const user = auth.user!

    // Hapus token pengguna saat ini
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)

    return response.ok({ message: 'Logged out successfully', test: auth.getUserOrFail() })
  }
}