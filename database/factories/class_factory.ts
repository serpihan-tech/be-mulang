import factory from '@adonisjs/lucid/factories'
import Class from '#models/class'
import { fakerID_ID as faker } from '@faker-js/faker'
import Teacher from '#models/teacher'

const usedNames = new Set<string>()
const usedTeacherIds = new Set<number>()

export const ClassFactory = factory
  .define(Class, async () => {
    const teachers = await Teacher.all()
    const classNames = [
      '10 MIPA 1',
      '10 MIPA 2',
      '10 MIPA 3',
      '11 MIPA 1',
      '11 MIPA 2',
      '11 MIPA 3',
      '12 MIPA 1',
      '12 MIPA 2',
      '12 MIPA 3',
    ]

    // Filter nama kelas yang belum digunakan dan belum ada di database
    const availableClassNames = classNames.filter(
      async (name) => !usedNames.has(name) && !(await Class.findBy('name', name))
    )
    if (availableClassNames.length === 0) {
      throw new Error('Tidak ada nama kelas yang tersedia.')
    }

    const className = faker.helpers.arrayElement(availableClassNames)
    usedNames.add(className)

    // Filter guru yang belum digunakan dan belum ada di database
    const availableTeachers = []
    for (const teacher of teachers) {
      if (!usedTeacherIds.has(teacher.id) && !(await Class.findBy('teacher_id', teacher.id))) {
        availableTeachers.push(teacher)
      }
    }

    if (availableTeachers.length === 0) {
      throw new Error('Tidak ada guru yang tersedia.')
    }

    const teacher = faker.helpers.arrayElement(availableTeachers)
    usedTeacherIds.add(teacher.id)

    return {
      name: className,
      teacherId: teacher.id,
    }
  })
  .build()
