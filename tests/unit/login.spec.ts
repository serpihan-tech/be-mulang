/* eslint-disable prettier/prettier */
import { test } from '@japa/runner'
import { createUserValidator } from '#validators/user'
import Score from '#models/score'

test('validasi detail pengguna', async ({ assert }) => {
  const payload = { email: 'email_salah' }

  try {
    await createUserValidator.validate(payload)
    assert.fail('Seharusnya validasi gagal, tetapi tidak.')
  } catch (error) {
    assert.isTrue(true) // Validasi gagal seperti yang diharapkan
  }
})

test('memproses input nilai dengan benar', async ({ assert }) => {
  const inputNilai = [
    { class_student_id: 1, module_id: 2, score_type_id: 3, score: 78, description: 'TH 1' },
    { class_student_id: 1, module_id: 2, score_type_id: 3, score: 84, description: 'TH 1' },
    { class_student_id: 3, module_id: 2, score_type_id: 3, score: 90, description: 'TH 1' },
    { class_student_id: 4, module_id: 2, score_type_id: 3, score: 96, description: 'TH 1' },
    { class_student_id: 5, module_id: 2, score_type_id: 3, score: 99, description: 'TH 1' },
    { class_student_id: 2, module_id: 2, score_type_id: 3, score: 100, description: 'TH 1' }
  ]

  for (const element of inputNilai) {   
    await Score.updateOrCreate(
      {
        class_student_id: element.class_student_id,
        module_id: element.module_id,
        score_type_id: element.score_type_id,
        description: element.description
      }, // Search criteria (harus unik)
      {
        score: element.score,
      } // Data yang akan diupdate
    )  
  }
  // eslint-disable-next-line @unicorn/no-await-expression-member
  const expectedOutput = (await Score.all()).map((score) => score.toJSON())  
  
  console.log(expectedOutput)
  // Pastikan jumlah data yang diproses benar
  assert.lengthOf(expectedOutput, inputNilai.length, 'Jumlah data yang dihasilkan tidak sesuai')

  console.log(expectedOutput)

  assert.deepEqual(expectedOutput[0], {
    class_Student_id: 1,
    module_id: 2,
    score_type_id: 3,
    score: 78,
    description: 'TH 1'
  }, 'Data pertama tidak sesuai')
})
