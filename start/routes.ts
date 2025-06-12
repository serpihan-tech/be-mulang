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
const SchoolCalendarsController = () => import('#controllers/school_calendars_controller')
const AdminsController = () => import('#controllers/admins_controller')
const RoomsController = () => import('#controllers/rooms_controller')

import { middleware } from '#start/kernel'
import transmit from '@adonisjs/transmit/services/main'
import app from '@adonisjs/core/services/app'
// untuk get media / file dari storage
import { join, normalize } from 'node:path'
import { existsSync } from 'node:fs'
import Env from '#start/env'


transmit.registerRoutes()

// test API Server
router.get('/say-hi', () => `Copyright © ${new Date().getFullYear()} - ${process.env.APP_NAME} by CV Serpihan Tech Solutions`)

router.post('/user/create', [UserController, 'create']).as('user.create') // TODO: Tambah Middleware Auth
router.post('/login', [AuthController, 'login']).as('auth.login')

// reset password
router.group(() => {
    router.post('/send-otp', [ResetPasswordController, 'sendOtp']).as('reset-password.send')
    router.post('/verify-otp', [ResetPasswordController, 'verifyOtp']).as('reset-password.verify')
    router.post('/reset-password', [ResetPasswordController, 'resetPassword']).as('reset-password.reset')
}).prefix('/forgot-password')

router.post('/check-role', [AuthController, 'checkRole']).as('auth.check-role')

// * GET MEDIA / FILE FROM SERVER STORAGE ---------------

router.get('file/*', async ({ params, response }) => {
  const pathSegments = params['*'].map((seg: string) => decodeURIComponent(seg))
  const relativePath = pathSegments.join('/')

  const basePath = app.makePath('storage/uploads')
  const safePath = normalize(join(basePath, relativePath))

  if (!safePath.startsWith(basePath)) {
    return response.unauthorized('Invalid path access')
  }

  if (!existsSync(safePath)) {
    return response.notFound('File not found')
  }

  return response.download(safePath)
})




router.group(() => {
    // Ganti password user
    router.post('change-password', [UserController, 'changePassword'])

    router.post('/logout', [AuthController, 'logout']).as('auth.logout')

    // dashboard
    router.group(() => {
        router.get('/', [DashboardController, 'index'])
        router.get('/chart-absences', [DashboardController, 'chartAbsencesForAdmins']).use(middleware.role(['admin']))    
    }).prefix('/dashboard')

    // Untuk admin
    router.group(() => {
        router.get('/', [AdminsController, 'index']).use(middleware.role(['admin']))
        router.get('/:id', [AdminsController, 'show'])
        router.post('/', [AdminsController, 'store']).use(middleware.role([''])) // ! All Roles Not Allowed
        router.patch('/:id', [AdminsController, 'update']).use(middleware.role(['admin']))
        router.delete('/:id', [AdminsController, 'destroy']).use(middleware.role(['']))
    }).prefix('/admins')

    // Untuk students
    router.group(() => {
        router.get('/export-excel', [StudentsController, 'exportExcel']).use(middleware.role(['admin']))
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
        router.get('/export-excel', [TeacherController, 'exportExcel']).use(middleware.role(['admin']))
        router.get('/id-name', [TeacherController, 'getIdName'])
        router.get('/classes-n-students', [TeacherController, 'getCountStudentsAndClasses']).use(middleware.role(['teacher']))
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
        router.post('/mass/students', [AbsenceController, 'massAbsences'])
        router.get('/mine', [AbsenceController, 'getMyAbsences']).use(middleware.role(['student'])) // * untuk data/fitur untuk siswa yang sedang login
        router.get('/student/:studentId/:scheduleId', [AbsenceController, 'getAbsencesBySchedule'])
        router.get('/students/:moduleId/:classId', [AbsenceController, 'getAbsencesByModule'])
        router.get('/', [AbsenceController, 'index'])
        router.post('/', [AbsenceController, 'store']) // TODO : Implementasi Absensi
        router.get('/:id', [AbsenceController, 'show'])
        router.patch('/:id', [AbsenceController, 'update'])
        router.delete('/:id', [AbsenceController, 'destroy'])
    }).prefix('/absences')

    // Classes
    router.group(() => {
        router.get('/teacher/is-homeroom', [ClassesController, 'isHomeroom']).use(middleware.role(['teacher']))
        router.get('/teacher/mine', [ClassesController, 'getClassTeacher']).use(middleware.role(['teacher']))
        router.get('/students/:classId/:moduleId', [ClassesController, 'getStudentsByClass'])
        router.get('/list-classes', [ClassesController, 'listClasses'])
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
        router.get('/active-year', [AcademicYearsController, 'activeYear'])
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
        router.post('/', [AnnouncementByTeachers, 'store']).use(middleware.role(['teacher']))
        router.patch('/:id', [AnnouncementByTeachers, 'update']).use(middleware.role(['teacher', 'admin']))
        router.delete('/:id', [AnnouncementByTeachers, 'destroy']).use(middleware.role(['teacher', 'admin']))
    }).prefix('/announcements/teachers')

    // Modules
    router.group(() => {
        router.get('/', [ModulesController, 'index'])
        router.get('/list-names', [ModulesController, 'listNames'])
        router.get('/list-modules', [ModulesController, 'listModules'])
        router.post('/', [ModulesController, 'store'])
        router.get('/:id', [ModulesController, 'show'])
        router.patch('/:id', [ModulesController, 'update'])
        router.delete('/:id', [ModulesController, 'destroy'])
    }).prefix('/modules')

    // Scores
    router.group(() => {
        router.get('/mine', [ScoreController, 'getOwnScores']).middleware(middleware.role(['student']))
        router.get('/my-scoring', [ScoreController, 'getMyScoring']).middleware(middleware.role(['teacher']))
        router.get('/recap-scoring', [ScoreController, 'getRecapScoring']).middleware(middleware.role(['teacher']))
        router.patch('/updates', [ScoreController, 'massUpdate']) // fitur naik kelas langsung beberapa murid
        router.get('/', [ScoreController, 'index'])
        router.post('/', [ScoreController, 'store'])
        router.get('/:id', [ScoreController, 'show'])
        router.patch('/:id', [ScoreController, 'update'])
        router.delete('/:id', [ScoreController, 'destroy'])
    }).prefix('/scores')

    // Teacher Absences
    router.group(() => {
        // router.get('/export-excel', [TeacherAbsenceController, 'exportExcel']).use(middleware.role(['teacher']))
        router.get('/export-excel', [TeacherAbsenceController, 'exportExcel']).use(middleware.role(['admin']))
        router.get('/mine-today', [TeacherAbsenceController, 'getMineToday']).use(middleware.role(['teacher']))
        router.get('/', [TeacherAbsenceController, 'index'])
        if (Env.get('NODE_ENV') === 'production') {
        router
            .post('/', [TeacherAbsenceController, 'store'])
            .use(middleware.imagecompressor())
            .use(middleware.ip('absen'))
        } else {
        router
            .post('/', [TeacherAbsenceController, 'store'])
            .use(middleware.imagecompressor())
        }

        router.get('/:id', [TeacherAbsenceController, 'show'])
        if (Env.get('NODE_ENV') === 'production') {
        router
            .patch('/:id', [TeacherAbsenceController, 'update'])
            .use(middleware.imagecompressor())
            .use(middleware.ip('absen'))
        } else {
        router
            .patch('/:id', [TeacherAbsenceController, 'update'])
            .use(middleware.imagecompressor())
        }
        router.delete('/:id', [TeacherAbsenceController, 'destroy'])
    }).prefix('/teacher-absences')

    // School Calendar / Kalender Akademik Sekolah
    router.group(() => {
        router.get('/', [SchoolCalendarsController, 'index'])
        router.post('/', [SchoolCalendarsController, 'store'])
        router.get('/:id', [SchoolCalendarsController, 'show'])
        router.patch('/:id', [SchoolCalendarsController, 'update'])
        router.delete('/:id', [SchoolCalendarsController, 'destroy'])
    }).prefix('/school-calendars')

    // Rooms
    router.group(() => {
        router.get('/list-rooms', [RoomsController, 'listRooms'])
        router.get('/', [RoomsController, 'index'])
        router.post('/', [RoomsController, 'store'])
        router.get('/:id', [RoomsController, 'show'])
        router.patch('/:id', [RoomsController, 'update'])
        router.delete('/:id', [RoomsController, 'destroy'])
    }).prefix('/rooms')

}).use(middleware.auth())



// Cek IP Address
router.get('/cek-ip', async ({ request, response }) => {
    return response.ok({ ip: request.ip })
}).use(middleware.ip('absen'))