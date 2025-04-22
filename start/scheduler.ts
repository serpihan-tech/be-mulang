import scheduler from 'adonisjs-scheduler/services/main'

scheduler.command('inspire').everyFiveSeconds()

scheduler
  .call(() => {
    console.log('Pruge DB!')
  })
  .everyFifteenSeconds()

scheduler
  .call(() => {
    try {
    } catch (error) {
      console.error(error)
    }
  })
  .dailyAt('05:00')
  .timezone('Asia/Jakarta')
