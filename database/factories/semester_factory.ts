import factory from '@adonisjs/lucid/factories'
import AcademicYear from '#models/academic_year'
import { fakerID_ID as faker } from '@faker-js/faker'

const usedNames = new Set<string>() // Menyimpan nama yang sudah dibuat

export const AcademicYearFactory = factory
  .define(AcademicYear, async () => {
    let name: string

    do {
      const tahunAwal = faker.number.int({ min: 2023, max: 2025 })
      const tahunAkhir = tahunAwal + 1
      name = faker.helpers.arrayElement([
        `Ganjil ${tahunAwal}/${tahunAkhir}`,
        `Genap ${tahunAwal}/${tahunAkhir}`,
      ])
    } while (usedNames.has(name)) // Ulangi sampai dapat yang unik

    usedNames.add(name) // Simpan nama yang sudah dipakai

    return { name }
  })
  .build()
