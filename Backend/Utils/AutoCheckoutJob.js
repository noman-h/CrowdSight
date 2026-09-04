const cron = require('node-cron')
const checkins = require('../Model/CheckInOutModel')

const AUTO_CHECKOUT_AFTER_HOURS = 4
const AUTO_CHECKOUT_AFTER_MS = AUTO_CHECKOUT_AFTER_HOURS * 60 * 60 * 1000
const AUTO_CHECKOUT_SCHEDULE = '* * * * *'

function startAutoCheckoutJob() {
  const task = cron.schedule(
    AUTO_CHECKOUT_SCHEDULE,
    async () => {
      try {
        const cutoff = new Date(Date.now() - AUTO_CHECKOUT_AFTER_MS)

        const result = await checkins.updateMany(
          {
            status: 'checkedin',
            checkouttime: null,
            checkintime: { $lte: cutoff },
          },
          [
            {
              $set: {
                status: 'checkedout',
                checkouttime: { $add: ['$checkintime', AUTO_CHECKOUT_AFTER_MS] },
              },
            },
          ],
          { updatePipeline: true },
        )

        if (result.modifiedCount > 0) {
          console.log(`Automatically checked out ${result.modifiedCount} expired visit(s).`)
        }
      } catch (error) {
        console.error('Scheduled automatic checkout failed:', error)
      }
    },
    {
      name: 'four-hour-auto-checkout',
      noOverlap: true,
      timezone: 'Asia/Kolkata',
    },
  )

  console.log(`Automatic checkout scheduled after ${AUTO_CHECKOUT_AFTER_HOURS} hours.`)
  return task
}

module.exports = {
  startAutoCheckoutJob,
}
