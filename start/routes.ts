/* eslint-disable prettier/prettier */
/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
const UserController = () => import('#controllers/users_controller')
const AuthController = () => import('#controllers/auth_controller')
const TeacherController = () => import('#controllers/teachers_controller')
const ResetPasswordController = () => import('#controllers/reset_password_controller')
const StudentsController = () => import('#controllers/students_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const ClassesController = () => import('#controllers/classes_controller')
const AcademicYearsController = () => import('#controllers/academic_years_controller')
import { middleware } from '#start/kernel'

router.post('/user/create', [UserController, 'create']).as('user.create') // TODO: Tambah Middleware Auth
router.post('/login', [AuthController, 'login']).as('auth.login')

// reset password
router.group(() => {
    router.post('/send-otp', [ResetPasswordController, 'sendOtp']).as('reset-password.send')
    router.post('/verify-otp', [ResetPasswordController, 'verifyOtp']).as('reset-password.verify')
    router.post('/reset-password', [ResetPasswordController, 'resetPassword']).as('reset-password.reset')
}).prefix('/forgot-password')

router.post('/check-role', [AuthController, 'checkRole']).as('auth.check-role')

router.group(() => {

    router.post('/logout', [AuthController, 'logout']).as('auth.logout')
    router.get('/dashboard', [DashboardController, 'index'])
    router.post('/dashboard', [DashboardController, 'index'])


    // untuk admin
    router.group(() => {
        // TODO : Implementasi Fitur Admin
    }).prefix('/admins')

    
    // untuk students
    router.resource('/students', StudentsController)
        .use(['store', 'update'], middleware.role(['teacher', 'admin']))
        .use('destroy', middleware.role(['admin']))
    
    router.group(() => {
        router.get('/presence/:studentId', [StudentsController, 'getPresence'])
        router.get('/schedule/:studentId', [StudentsController, 'getSchedule'])
    }).prefix('/students')

    //untuk teachers
    router.resource('/teachers', TeacherController)
        .use(['store', 'destroy'], middleware.role(['admin']))
        .use('update', middleware.role(['teacher', 'admin']))
    router.group(() => {
        // TODO : Implementasi Fitur Teacher
    }).prefix('/teachers')

    router.resource('/classes', ClassesController)
    router.resource('/academic-years', AcademicYearsController)
    
}).use(middleware.auth())
