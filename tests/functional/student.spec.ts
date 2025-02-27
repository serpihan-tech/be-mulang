// import { test } from '@japa/runner'
// import Student from '#models/student'
// import Schedule from '#models/schedule'
// import ClassStudent from '#models/class_student'
// import Absence from '#models/absence'

// test.group('Student', () => {
//   test('Get schedule for authenticated student', async ({ assert, client }) => {
//     // Simulasi user yang login
//     const student = await Student.query().first()
//     if (!student) {
//       console.log('⚠️ Tidak ada mahasiswa dalam database')
//       return assert.fail('Mahasiswa tidak ditemukan')
//     }

//     // Simulasi auth
//     const response = await client.get('/schedule').loginAs(student)

//     // Tampilkan response ke console
//     console.log('✅ Response:', response.body())

//     // Pastikan response sesuai
//     response.assertStatus(200)
//     assert.exists(response.body().data.schedule, 'Schedule tidak ditemukan')
//     assert.exists(response.body().data.presence, 'Presence tidak ditemukan')
//   })
// })
