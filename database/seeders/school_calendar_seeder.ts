import SchoolCalendar from '#models/school_calendar'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await SchoolCalendar.createMany([
      {
        date_start: new Date('2024-10-14'),
        date_end: new Date('2024-10-18'),
        description: 'Periode UTS Semester Ganjil 2024/2025',
      },
      {
        date_start: new Date('2025-01-20'),
        date_end: new Date('2025-01-24'),
        description: 'Periode UAS Semester Ganjil 2024/2025',
      },
      {
        date_start: new Date('2025-04-14'),
        date_end: new Date('2025-04-18'),
        description: 'Periode UTS Semester Genap 2024/2025',
      },
      {
        date_start: new Date('2025-06-16'),
        date_end: new Date('2025-06-20'),
        description: 'Periode UAS Semester Genap 2024/2025',
      },
      {
        date_start: new Date('2024-07-15'),
        date_end: new Date('2024-07-19'),
        description: 'Masa Orientasi Siswa Baru',
      },
      {
        date_start: new Date('2024-12-23'),
        date_end: new Date('2025-01-05'),
        description: 'Libur Semester Ganjil',
      },
      {
        date_start: new Date('2025-06-23'),
        date_end: new Date('2025-07-13'),
        description: 'Libur Semester Genap',
      },
      {
        date_start: new Date('2024-08-17'),
        date_end: new Date('2024-08-17'),
        description: 'Upacara HUT RI Ke-79',
      },
      {
        date_start: new Date('2024-11-10'),
        date_end: new Date('2024-11-10'),
        description: 'Peringatan Hari Pahlawan',
      },
      {
        date_start: new Date('2024-09-25'),
        date_end: new Date('2024-09-25'),
        description: 'Peringatan Hari Bahasa dan Sastra',
      },
      {
        date_start: new Date('2025-02-14'),
        date_end: new Date('2025-02-14'),
        description: 'Pentas Seni Sekolah',
      },
      {
        date_start: new Date('2025-03-01'),
        date_end: new Date('2025-03-01'),
        description: 'Lomba Olimpiade Sains',
      },
      {
        date_start: new Date('2025-05-02'),
        date_end: new Date('2025-05-02'),
        description: 'Peringatan Hari Pendidikan Nasional',
      },
      {
        date_start: new Date('2024-10-28'),
        date_end: new Date('2024-10-28'),
        description: 'Peringatan Hari Sumpah Pemuda',
      },
      {
        date_start: new Date('2025-04-21'),
        date_end: new Date('2025-04-21'),
        description: 'Peringatan Hari Kartini',
      },
      {
        date_start: new Date('2025-06-01'),
        date_end: new Date('2025-06-01'),
        description: 'Peringatan Hari Lahir Pancasila',
      },
      {
        date_start: new Date('2025-03-17'),
        date_end: new Date('2025-03-17'),
        description: 'Peringatan Hari Kesaktian Pancasila',
      },
      {
        date_start: new Date('2025-05-20'),
        date_end: new Date('2025-05-20'),
        description: 'Peringatan Hari Kebangkitan Nasional',
      },
    ])
  }
}
