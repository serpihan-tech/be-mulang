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
const AbsenceController = () => import('#controllers/absences_controller')
const SchedulesController = () => import('#controllers/schedules_controller')
const ModulesController = () => import('#controllers/modules_controller')
const AnnouncementByAdmins = () => import('#controllers/announcement_by_admins_controller')
const ScoreController = () => import('#controllers/scores_controller')

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


    // untuk admin
    router.group(() => {
        // TODO : Implementasi Fitur Admin
    }).prefix('/admins')

    // untuk students
    router.group(() => {
        router.resource('/students', StudentsController)
        
        router.group(() => {
            router.post('/promote', [StudentsController, 'promoteClass'])
            router.get('/presence/:studentId', [StudentsController, 'getPresence'])
            router.get('/schedule/:studentId', [StudentsController, 'getSchedule'])
        }).prefix('/students')     
    })

    //untuk teachers
    router.group(() => {     
        router.resource('/teachers', TeacherController)
            .use(['store', 'destroy'], middleware.role(['admin']))
            .use('update', middleware.role(['teacher', 'admin']))
        router.group(() => {
            // TODO : Implementasi Fitur Teacher
        }).prefix('/teachers')
    })

    // Schedule / Jadwal
    router.group(() => {
        router.resource('/schedules', SchedulesController)
    })

    // Absensi
    router.group(() => {
        router.resource('/absences', AbsenceController)
    })

    // Classes
    router.group(() => {
        router.resource('/classes', ClassesController)
    })
    
    // Academic Years
    router.group(() => {
        router.resource('/academic-years', AcademicYearsController)
    })
    
    // Announcements By Admin
    router.group(() => {
        router.resource('/admin-announcement', AnnouncementByAdmins)
    })
    
    // Modules
    router.get('/modules/filter', [ModulesController, 'getByFilter'])
    router.resource('/modules', ModulesController)

    // Scores
    router.get('/scores/filter', [ScoreController, 'getByFilter'])
    router.patch('/scores/updates', [ScoreController, 'massUpdate'])
    router.resource('/scores', ScoreController)

    
}).use(middleware.auth())


// Cek IP Address
router.get('/cek-ip', async ({ request, response }) => {
    return response.ok({ ip: request.ip })
}).use(middleware.ip('absen'))

router.get('/cek-st', [StudentsController, 'cek'])
