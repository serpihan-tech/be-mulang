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
const AuthController = () => import('#controllers/auth_controller')
import { middleware } from './kernel.js'

router.post('/login', [AuthController, 'login']).as('auth.login')
router.post('/logout', [AuthController, 'logout']).as('auth.logout').use(middleware.auth())
