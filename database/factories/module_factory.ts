import factory from '@adonisjs/lucid/factories'
import Module from '#models/module'
import { fakerID_ID as faker } from '@faker-js/faker'
import Teacher from '#models/teacher'
import AcademicYear from '#models/academic_year'

const usedModuleNames = new Set<string>()

export const ModuleFactory = factory
  .define(Module, async () => {
    const academicYears = await AcademicYear.all()
    const teachers = await Teacher.all()

    let moduleName: string

    do {
      moduleName = faker.helpers.arrayElement([
        'Matematika Peminatan',
        'Teknologi Informasi',
        'Pendidikan Pancasila dan Kewarganegaraan',
        'Pendidikan Jasmani, Olahraga, dan Kesehatan',
        'Pendidikan Agama Islam',
        'Pendidikan Agama Kristen',
        'Pendidikan Agama Katholik',
        'Pendidikan Agama Hindu',
        'Pendidikan Agama Budha',
        'Seni Budaya',
        'Bahasa Jawa',
        'Ekonomi',
        'Sosiologi',
        'Geografi',
        'Sejarah',
        'Bahasa Jerman',
        'Bahasa Perancis',
        'Bahasa Spanyol',
        'Bahasa Mandarin',
        'Fisika',
        'Kimia',
        'Biologi',
        'Bahasa Inggris',
        'Bahasa Indonesia',
        'Matematika Wajib',
      ])
    } while (usedModuleNames.has(moduleName) || (await Module.findBy('name', moduleName)))

    usedModuleNames.add(moduleName)

    return {
      name: moduleName,
      academic_year_id: faker.helpers.arrayElement(academicYears).id,
      teacher_id: faker.helpers.arrayElement(teachers).id,
    }
  })
  .build()
