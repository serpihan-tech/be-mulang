import scheduler from 'adonisjs-scheduler/services/main'
import AnnouncementSchedules from '../app/schedules/announcement_schedules.js'

// scheduler.command('inspire').everyFiveSeconds()

// scheduler
//   .call(() => {
//     console.log('Pruge DB!')
//   })
//   .everyFifteenSeconds()

scheduler
  .call(async () => {
    try {
      console.log(`Running Schedules at ${new Date().toLocaleString()} ....`)
      await AnnouncementSchedules.postAnnouncementByAdmin()
      await AnnouncementSchedules.postAnnouncementByTeacher()
    } catch (error) {
      console.error(error)
    }
  })
  .dailyAt('00:00')
  .timezone('Asia/Jakarta')
  .withoutOverlapping()
