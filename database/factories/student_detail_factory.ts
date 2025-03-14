import factory from '@adonisjs/lucid/factories'
import StudentDetail from '#models/student_detail'
import { fakerID_ID as faker } from '@faker-js/faker'
import Student from '#models/student'

const usedStudentIds = new Set<number>()

export const StudentDetailFactory = factory
  .define(StudentDetail, async ({}) => {
    const religion = faker.helpers.arrayElement([
      'Kristen',
      'Katolik',
      'Islam',
      'Hindu',
      'Budha',
      'Konghucu',
    ])
    const gender = faker.helpers.arrayElement(['laki-laki', 'perempuan'])
    const state = faker.location.state()
    const city = faker.location.city()
    const address = `${faker.location.streetAddress({ useFullAddress: true })}, 
        ${city}, 
        ${state},
        ${faker.location.zipCode({ format: '#####' })}`
    const parentsName = faker.person.fullName()
    const parentsPhone = faker.phone.number({ style: 'human' })
    const parentsJob = faker.helpers.arrayElement([
      'Guru PNS',
      'Buruh',
      'Dokter',
      'Petani',
      'Wiraswata',
      'Tidak Bekerja',
      'Pekerja Lepas',
      'Desainer',
      'Programmer PHP',
      'Penyebar Howak',
      'Bupati',
      'Anggota DPR',
      'Karyawan / Pegawai Swasta',
      'Petinju',
      'Pengacara',
      'Ketua HIMA',
      'Presiden BEM',
      'Pengusaha',
      'Kontraktor',
      'Teknisi Elektronik',
      'Pedagang',
      'Asisten Rumah Tangga',
      'Dosen',
      'Pengajar',
      'Pelatih Sepakbola',
      'Pengepul',
      'Pemain Sepakbola',
      'Atlet',
      'TNI',
      'Polisi',
      'Paspampres',
      'Ajudan',
      'Satpam',
      'Pengawal',
      'Teller Bank',
      'Debt Collector',
      'Pengurus Lahan',
      'Jaksa',
      'Hakim',
      'Pengacara',
      'Pemadam Kebakaran',
      'Direktur Danantara',
      'Penembak Jitu',
      'Podcaster',
      'Youtuber',
      'Reporter',
      'Pembawa Berita',
      'Komentator',
      'Konten Kreator',
      'Pemilik Rental PS',
      'Bidan',
      'Perawat',
      'Ahli Bedah',
      'Frontend',
      'Almighty Backend',
    ])
    const studentsPhone = faker.phone.number({ style: 'human' })
    const nis = faker.string.numeric(10)
    const nisn = faker.string.numeric(10)
    const birthDate = faker.date.between({ from: '2007-01-01', to: '2010-12-31' })
    const birthPlace = city
    const enrollmentYear = faker.date.between({ from: '2023', to: '2025' })

    let students = await Student.query()
      .whereBetween('id', [1, 450])
      .whereNotIn('id', (query) => {
        query.from('student_details').select('student_id')
      })

    // Filter student yang belum digunakan dalam batch ini
    students = students.filter((student) => !usedStudentIds.has(student.id))

    if (students.length === 0) {
      throw new Error('Tidak ada student yang tersedia untuk StudentDetail.')
    }

    // Pilih student secara acak
    const student = faker.helpers.arrayElement(students)

    // Tandai student_id agar tidak digunakan lagi dalam batch ini
    usedStudentIds.add(student.id)

    return {
      studentId: student.id,
      religion,
      gender,
      address,
      parentsName: parentsName,
      parentsPhone: parentsPhone,
      parentsJob: parentsJob,
      studentsPhone: studentsPhone,
      nis,
      nisn,
      birthDate: birthDate,
      birthPlace: birthPlace,
      enrollmentYear: enrollmentYear,
      profilePicture: faker.image.avatar(),
    }
  })
  .build()
