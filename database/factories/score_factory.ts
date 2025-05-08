/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import Score from '#models/score'
import { fakerID_ID as faker } from '@faker-js/faker'
import ScoreType from '#models/score_type'
import ClassStudent from '#models/class_student'
import Module from '#models/module'

export const ScoreFactory = factory
  .define(Score, async () => {
    const scoreType = (await ScoreType.query()).map((st) => st.id)
    const csIds = (await ClassStudent.query()).map((cs) => cs.id)
    const mId = (await Module.query()).map((m) => m.id)

    return {
      scoreTypeId: faker.helpers.arrayElement(scoreType),
      classStudentId: faker.helpers.arrayElement(csIds),
      moduleId: faker.helpers.arrayElement(mId),
      score: faker.number.int({ min: 55, max: 100 }),
      description: faker.helpers.arrayElement(['Tugas 1', 'Tugas 2', 'Tugas 3']),
    }
  })
  .build()
