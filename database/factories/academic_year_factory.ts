import factory from '@adonisjs/lucid/factories'
import AcademicYear from '#models/academic_year'
import { fakerID_ID as faker } from '@faker-js/faker'

// Map untuk melacak apakah tahun akademik sudah memiliki semester tertentu
const academicYearTracker = new Map<string, 'ganjil' | 'genap'>()

export const AcademicYearFactory = factory
  .define(AcademicYear, async () => {
    const name = faker.helpers.arrayElement([
      '2023/2024',
      '2024/2025',
      '2025/2026',
      '2026/2027',
      '2027/2028',
    ])

    // Menentukan status aktif hanya untuk tahun akademik sekarang
    const currentYear = '2024/2025'
    const status = name === currentYear

    // Pastikan ganjil dan genap seimbang
    let semester: 'ganjil' | 'genap' = 'ganjil'
    if (academicYearTracker.has(name)) {
      semester = academicYearTracker.get(name) === 'ganjil' ? 'genap' : 'ganjil'
    }
    academicYearTracker.set(name, semester) // Simpan semester yang baru dibuat

    // Tentukan rentang waktu berdasarkan semester
    const yearStart = Number.parseInt(name.split('/')[0], 10)

    let dateStart: Date
    let dateEnd: Date

    if (semester === 'ganjil') {
      dateStart = faker.date.between({
        from: `${yearStart}-06-30`,
        to: `${yearStart}-07-20`,
      })
      dateEnd = faker.date.between({
        from: `${yearStart}-12-22`,
        to: `${yearStart + 1}-01-05`,
      })
    } else {
      dateStart = faker.date.between({
        from: `${yearStart + 1}-01-01`,
        to: `${yearStart + 1}-02-01`,
      })
      dateEnd = faker.date.between({
        from: `${yearStart + 1}-06-14`,
        to: `${yearStart + 1}-07-31`,
      })
    }

    return {
      name,
      status,
      semester,
      dateStart: dateStart,
      dateEnd: dateEnd,
    }
  })
  .build()
