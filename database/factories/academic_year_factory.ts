import factory from '@adonisjs/lucid/factories'
import AcademicYear from '#models/academic_year'

export const AcademicYearFactory = factory
  .define(AcademicYear, async ({ faker }) => {
    return {}
  })
  .build()