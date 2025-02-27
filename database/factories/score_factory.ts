/* eslint-disable @unicorn/no-await-expression-member */
import factory from '@adonisjs/lucid/factories'
import Score from '#models/score'
import { fakerID_ID as faker } from '@faker-js/faker'
import ScoreType from '#models/score_type'
import ClassStudent from '#models/class_student'

export const ScoreFactory = factory
  .define(Score, async () => {
    const scoreType = (await ScoreType.query()).map((st) => st.id)
    const csIds = (await ClassStudent.query()).map((cs) => cs.id)

    return {
      score_type_id: faker.helpers.arrayElement(scoreType),
      class_student_id: faker.helpers.arrayElement(csIds),
      score: faker.number.int({ min: 55, max: 100 }),
      description: faker.helpers.arrayElement(['Tugas 1', 'Tugas 2', 'Tugas 3']),
    }
  })
  .build()
