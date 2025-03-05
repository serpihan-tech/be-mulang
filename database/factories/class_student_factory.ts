/* eslint-disable @unicorn/no-await-expression-member */
/* eslint-disable @typescript-eslint/no-shadow */
import factory from '@adonisjs/lucid/factories'
import ClassStudent from '#models/class_student'
import { fakerID_ID as faker } from '@faker-js/faker'
import Class from '#models/class'
import Student from '#models/student'
import AcademicYear from '#models/academic_year'

export const ClassStudentFactory = factory
  .define(ClassStudent, async ({}) => {
    const kelas = (await Class.query()).map((kelas) => kelas.id)
    const student = (await Student.query()).map((student) => student.id)
    const academicYear = (await AcademicYear.query()).map((academic_year) => academic_year.id)

    return {
      class_id: faker.helpers.arrayElement(kelas),
      student_id: faker.helpers.arrayElement(student),
      academic_year_id: faker.helpers.arrayElement(academicYear),
    }
  })
  .build()
