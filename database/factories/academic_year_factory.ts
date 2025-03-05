import factory from '@adonisjs/lucid/factories'
import AcademicYear from '#models/academic_year'

export const AcademicYearFactory = factory
  .define(AcademicYear, async ({ faker }) => {
    const name = faker.helpers.arrayElement([
      '2023/2024',
      '2024/2025',
      '2025/2026',
      '2026/2027',
      '2027/2028',
    ])
    let status: boolean = false

    if (name === '2023/2024') {
      status = true
    }

    return {
      name: name,
      status: status,
      date_start: faker.date.past(),
      date_end: faker.date.future(),
      academic_year: faker.helpers.arrayElement(['ganjil', 'genap']),
    }
  })
  .build()
