/* eslint-disable @unicorn/no-await-expression-member */
/* eslint-disable @typescript-eslint/no-shadow */
import factory from '@adonisjs/lucid/factories'
import ClassStudent from '#models/class_student'
import { fakerID_ID as faker } from '@faker-js/faker'
import Class from '#models/class'
import Student from '#models/student'
import Semester from '#models/semester'

export const ClassStudentFactory = factory
  .define(ClassStudent, async ({}) => {
    const kelas = (await Class.query()).map((kelas) => kelas.id)
    const student = (await Student.query()).map((student) => student.id)
    const semester = (await Semester.query()).map((semester) => semester.id)

    return {
      class_id: faker.helpers.arrayElement(kelas),
      student_id: faker.helpers.arrayElement(student),
      semester_id: faker.helpers.arrayElement(semester),
    }
  })
  .build()
