/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'


const UserController = () => import('#controllers/users_controller')

router.get('/', async () => {
  return {
    hello: 'world',
  }
})

router.get('/users', async () => {
  return {
    hello: 'world',
  }
})

// User Controller
router.post('/user/create', [UserController, 'create']) // Create User
router.post('/login', [UserController, 'login']) // Login System
router.post('/logout', [UserController, 'logout']).use(middleware.auth()) // Login System

// router.post('users/:id/tokens', async ({ params }) => {
//   const user = await User.findOrFail(params.id)
//   const token = await User.accessTokens.create(user)

//   return {
//     type: 'bearer',
//     value: token.value!.release(),
//   }
// })