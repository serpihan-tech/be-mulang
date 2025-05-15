import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import AcademicYear from '#models/academic_year'

async function getAbsenceData(startDate: DateTime, endDate: DateTime) {
  const range: string[] = []
  let cursor = startDate

  while (cursor <= endDate) {
    const isoDate = cursor.toISODate()
    if (!isoDate) continue
    range.push(isoDate)
    cursor = cursor.plus({ days: 1 })
  }

  const siswaHadir: { date: string; value: number }[] = []
  const siswaTidakHadir: { date: string; value: number }[] = []
  const guruHadir: { date: string; value: number }[] = []
  const guruTidakHadir: { date: string; value: number }[] = []

  for (const date of range) {
    const siswaHadirCount = await db
      .from('absences')
      .where('date', date)
      .where('status', 'Hadir')
      .count('* as total')

    const siswaTidakHadirCount = await db
      .from('absences')
      .where('date', date)
      .where('status', '!=', 'Hadir')
      .count('* as total')

    const guruHadirCount = await db
      .from('teacher_absences')
      .where('date', date)
      .where('status', 'Hadir')
      .count('* as total')

    const guruTidakHadirCount = await db
      .from('teacher_absences')
      .where('date', date)
      .where('status', '!=', 'Hadir')
      .count('* as total')

    siswaHadir.push({ date, value: Number(siswaHadirCount[0].total) })
    siswaTidakHadir.push({ date, value: Number(siswaTidakHadirCount[0].total) })
    guruHadir.push({ date, value: Number(guruHadirCount[0].total) })
    guruTidakHadir.push({ date, value: Number(guruTidakHadirCount[0].total) })
  }

  return {
    siswa: {
      hadir: siswaHadir,
      tidakHadir: siswaTidakHadir,
    },
    guru: {
      hadir: guruHadir,
      tidakHadir: guruTidakHadir,
    },
  }
}

test.group('Chart absences', () => {
  test('generate absence data with filters', async ({ assert }) => {
    const now = DateTime.local()

    // Mingguan (Senin - Minggu)
    const startOfWeek = now.startOf('week').plus({ days: 1 })
    const endOfWeek = startOfWeek.plus({ days: 6 })
    const mingguan = await getAbsenceData(startOfWeek, endOfWeek)

    // Bulanan (Tanggal 1 - akhir bulan)
    const startOfMonth = now.startOf('month')
    const endOfMonth = now.endOf('month')
    const bulanan = await getAbsenceData(startOfMonth, endOfMonth)

    // Semester (dari academic year aktif)
    const semesterAktif = await AcademicYear.query().where('status', true).firstOrFail()
    const startOfSemester = DateTime.fromISO(semesterAktif.dateStart.toISOString())
    const endOfSemester = DateTime.fromISO(semesterAktif.dateEnd.toISOString())
    const semester = await getAbsenceData(startOfSemester, endOfSemester)

    const data = {
      mingguan,
      bulanan,
      semester,
    }

    console.info('Contoh data mingguan:', data.semester.siswa)

    assert.isArray(data.mingguan.siswa.hadir)
    assert.isArray(data.bulanan.guru.tidakHadir)
    assert.isArray(data.semester.siswa.tidakHadir)
  })
})
