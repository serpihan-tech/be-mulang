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
const AnnouncementByTeachers = () => import('#controllers/announcement_by_teachers_controller')
const ScoreController = () => import('#controllers/scores_controller')
const TeacherAbsenceController = () => import('#controllers/teacher_absences_controller')

import { middleware } from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'
import { throttle } from './limiter.js'
import app from '@adonisjs/core/services/app' 

transmit.registerRoutes()

router.post('/user/create', [UserController, 'create']).as('user.create') // TODO: Tambah Middleware Auth
router.post('/login', [AuthController, 'login']).as('auth.login')

// reset password
router.group(() => {
    router.post('/send-otp', [ResetPasswordController, 'sendOtp']).as('reset-password.send')
    router.post('/verify-otp', [ResetPasswordController, 'verifyOtp']).as('reset-password.verify')
    router.post('/reset-password', [ResetPasswordController, 'resetPassword']).as('reset-password.reset')
}).prefix('/forgot-password')

router.post('/check-role', [AuthController, 'checkRole']).as('auth.check-role')

// ! This shit cause error on url '/' no matter what the prefixs are, be careful
// cek return gambar
router.get('student-profile/:url', async ({ params, response }) => { 
    const filePath = app.makePath('storage/uploads/students-profile', params.url)

    return response.download(filePath) // {{ ngrok }}/namaFile ... e.g : localhost:3333/test.jpg
})

router.group(() => {
    // Ganti password user
    router.post('change-password', [UserController, 'changePassword'])

    router.post('/logout', [AuthController, 'logout']).as('auth.logout')
    router.get('/dashboard', [DashboardController, 'index'])
    
    // Untuk admin
    router.group(() => {
        // TODO : Implementasi Fitur Admin
    }).prefix('/admins')

    // Untuk students
    router.group(() => {
        router.get('/', [StudentsController, 'index'])
        router.get('/:id', [StudentsController, 'show'])
        router.post('/', [StudentsController, 'store'])
        router.patch('/:id', [StudentsController, 'update'])
        router.delete('/:id', [StudentsController, 'destroy'])
        router.post('/promote', [StudentsController, 'promoteClass'])
        router.get('/presence/:studentId', [StudentsController, 'getPresence'])
        router.get('/schedule/:studentId', [StudentsController, 'getSchedule'])    
    }).prefix('/students')     

    // Untuk teachers   
    router.group(() => {
        router.get('/id-name', [TeacherController, 'getIdName'])
        router.get('/', [TeacherController, 'index'])
        router.post('/', [TeacherController, 'store']).use(middleware.role(['admin']))
        router.get('/:id', [TeacherController, 'show'])
        router.patch('/:id', [TeacherController, 'update']).use(middleware.role(['teacher', 'admin']))
        router.delete('/:id', [TeacherController, 'destroy']).use(middleware.role(['admin']))

    }).prefix('/teachers')

    // Schedule / Jadwal
    router.group(() => {
        router.get('/teacher/mine', [SchedulesController, 'teachersSchedule']).use(middleware.role(['teacher']))
        router.get('/', [SchedulesController, 'index'])
        router.post('/', [SchedulesController, 'store'])
        router.get('/:id', [SchedulesController, 'show'])
        router.patch('/:id', [SchedulesController, 'update'])
        router.delete('/:id', [SchedulesController, 'destroy'])
    }).prefix('schedules')

    // Absensi
    router.group(() => {
        router.get('/mine', [AbsenceController, 'getMyAbsences']) // * untuk data/fitur untuk siswa yang sedang login
        
        router.get('/', [AbsenceController, 'index'])
        // router.post('/', [AbsenceController, 'store']) // TODO : Implementasi Absensi
        // router.get('/:id', [AbsenceController, 'show'])
        router.patch('/:id', [AbsenceController, 'update'])
        router.delete('/:id', [AbsenceController, 'destroy'])
    }).prefix('/absences')

    // Classes
    router.group(() => {
        router.get('/', [ClassesController, 'index'])
        router.post('/', [ClassesController, 'store'])
        router.get('/:id', [ClassesController, 'show'])
        router.patch('/:id', [ClassesController, 'update'])
        router.delete('/:id', [ClassesController, 'destroy'])
    }).prefix('classes')

    // Academic Years
    router.group(() => {
        router.get('/mine', [AcademicYearsController, 'myAcademicYear'])
            .use(middleware.role(['student'])) // * untuk data/fitur untuk siswa yang sedang login
        router.get('/', [AcademicYearsController, 'index'])
        router.post('/', [AcademicYearsController, 'store'])
        router.get('/:id', [AcademicYearsController, 'show'])
        router.patch('/:id', [AcademicYearsController, 'update'])
        router.delete('/:id', [AcademicYearsController, 'destroy'])
    }).prefix('/academic-years')

    // Announcement get Both Admin and Teacher
    router.get('/announcements', [AnnouncementByAdmins, 'getBoth']).use(middleware.role(['admin']))

    // Announcements By Admin
    router.group(() => {
        router.get('/', [AnnouncementByAdmins, 'index'])
        router.get('/:id', [AnnouncementByAdmins, 'show'])
        router.post('/', [AnnouncementByAdmins, 'store']).use(middleware.role(['admin']))
        router.patch('/:id', [AnnouncementByAdmins, 'update']).use(middleware.role(['admin']))
        router.delete('/:id', [AnnouncementByAdmins, 'destroy']).use(middleware.role(['admin']))
    }).prefix('/announcements/admins')
    
    // Announcements By Teachers
    router.group(() => {
        router.get('/', [AnnouncementByTeachers, 'index'])
        router.get('/:id', [AnnouncementByTeachers, 'show'])
        router.post('/', [AnnouncementByTeachers, 'store']).use(middleware.role(['admin']))
        router.patch('/:id', [AnnouncementByTeachers, 'update']).use(middleware.role(['admin']))
        router.delete('/:id', [AnnouncementByTeachers, 'destroy']).use(middleware.role(['admin']))
    }).prefix('/announcements/teachers')

    // Announcements By Teachers
    router.group(() => {
        // TODO : Implementasi Fitur Teacher
    })

    // Modules
    router.group(() => {
        router.get('/', [ModulesController, 'index'])
        router.post('/', [ModulesController, 'store'])
        router.get('/:id', [ModulesController, 'show'])
        router.patch('/:id', [ModulesController, 'update'])
        router.delete('/:id', [ModulesController, 'destroy'])
    }).prefix('/modules')

    // Scores
    router.group(() => {
        router.get('/mine', [ScoreController, 'getOwnScores']).middleware(middleware.role(['student']))
        router.patch('/updates', [ScoreController, 'massUpdate']) // fitur naik kelas langsung beberapa murid
        router.get('/', [ScoreController, 'index'])
        router.post('/', [ScoreController, 'store'])
        router.get('/:id', [ScoreController, 'show'])
        router.patch('/:id', [ScoreController, 'update'])
        router.delete('/:id', [ScoreController, 'destroy'])
    }).prefix('/scores')

    // Teacher Absences
    router.group(() => {
        router.get('/', [TeacherAbsenceController, 'index'])
        router.post('/', [TeacherAbsenceController, 'store'])
        router.get('/:id', [TeacherAbsenceController, 'show'])
        router.patch('/:id', [TeacherAbsenceController, 'update'])
        router.delete('/:id', [TeacherAbsenceController, 'destroy'])
    }).prefix('/teacher-absences')

}).use(middleware.auth())



// Cek IP Address
router.get('/cek-ip', async ({ request, response }) => {
    return response.ok({ ip: request.ip })
}).use(middleware.ip('absen'))