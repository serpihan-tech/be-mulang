import Room from '#models/room'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    const roomNames = [
      '10 MIPA 1',
      '10 MIPA 2',
      '10 MIPA 3',
      '11 MIPA 1',
      '11 MIPA 2',
      '11 MIPA 3',
      '12 MIPA 1',
      '12 MIPA 2',
      '12 MIPA 3',
      'Lapangan Sepakbola',
      'Lapangan Basket',
      'Lab Komputer 1',
      'Lab Komputer 2',
      'Aula 1',
      'Aula 2',
    ]
    for (const roomName of roomNames) {
      await Room.create({
        name: roomName,
      })
    }
  }
}
