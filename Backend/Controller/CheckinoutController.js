const checkins = require('../Model/CheckInOutModel')
const qrs = require('../Model/QrModel')
const palaces = require('../Model/PalaceModel')

exports.scan = async (req, res) => {
  try {
    const code = req.params.code?.trim()
    const userid = req.user?._id

    if (!code || !userid) {
      return res.status(400).json({ message: 'A valid QR code is required.' })
    }

    const qr = await qrs.findOne({ code })

    if (!qr) {
      return res.status(404).json({ message: 'QR code not found or invalid.' })
    }

    if (!qr.activestatus) {
      return res.status(403).json({ message: 'This QR code is currently inactive.' })
    }

    const palace = await palaces.findById(qr.palaceid)

    if (!palace || !palace.activestatus || palace.approvestatus !== 'approved') {
      return res.status(403).json({ message: 'This palace is currently unavailable.' })
    }

    const activeCheckin = await checkins.findOne({
      userid,
      status: 'checkedin',
      checkouttime: null,
    })

    if (activeCheckin) {
      if (String(activeCheckin.palaceid) !== String(qr.palaceid)) {
        return res.status(409).json({
          message: 'You are already checked in at another palace. Check out there first.',
        })
      }

      activeCheckin.checkouttime = new Date()
      activeCheckin.status = 'checkedout'
      await activeCheckin.save()

      return res.status(200).json({
        action: 'checkout',
        message: `Checked out from ${palace.name} successfully.`,
        checkin: activeCheckin,
        reviewContext: {
          checkinid: activeCheckin._id,
          palaceid: palace._id,
          palaceName: palace.name,
        },
      })
    }

    const checkin = await checkins.create({
      userid,
      qrid: qr._id,
      palaceid: qr.palaceid,
      checkintime: new Date(),
      status: 'checkedin',
    })

    return res.status(201).json({
      action: 'checkin',
      message: `Checked in at ${palace.name} successfully.`,
      checkin,
    })
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

exports.getMine = async (req, res) => {
  try {
    const { fromdate, todate, status } = req.query
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100)
    const match = { userid: req.user._id }

    if (status && status !== 'all') {
      if (!['checkedin', 'checkedout'].includes(status)) {
        return res.status(400).json({ message: 'Invalid check-in status.' })
      }
      match.status = status
    }

    if (fromdate || todate) {
      match.checkintime = {}
    }

    if (fromdate) {
      const startDate = new Date(fromdate)
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid from date.' })
      }
      startDate.setHours(0, 0, 0, 0)
      match.checkintime.$gte = startDate
    }

    if (todate) {
      const endDate = new Date(todate)
      if (Number.isNaN(endDate.getTime())) {
        return res.status(400).json({ message: 'Invalid to date.' })
      }
      endDate.setHours(23, 59, 59, 999)
      match.checkintime.$lte = endDate
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'palaces',
          localField: 'palaceid',
          foreignField: '_id',
          as: 'palace',
        },
      },
      { $unwind: { path: '$palace', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'palacereviews',
          localField: '_id',
          foreignField: 'checkinid',
          as: 'review',
        },
      },
      { $unwind: { path: '$review', preserveNullAndEmptyArrays: true } },
      { $sort: { checkintime: req.query.sort === 'oldest' ? 1 : -1 } },
    ]

    const countResult = await checkins.aggregate([...pipeline, { $count: 'totalcount' }])
    const totalcount = countResult[0]?.totalcount || 0

    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $project: {
          checkintime: 1,
          checkouttime: 1,
          status: 1,
          'palace._id': 1,
          'palace.name': 1,
          'palace.address': 1,
          'review._id': 1,
          'review.rating': 1,
          'review.description': 1,
          'review.createdAt': 1,
          'review.updatedAt': 1,
        },
      },
    )

    const result = await checkins.aggregate(pipeline)
    return res.status(200).json({ result, totalcount })
  } catch (err) {
    console.error('Error loading user check-ins:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}


exports.getall = async (req, res) => {
  try {
    const { search, sort, fromdate, todate } = req.query
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 5000)

    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'userid',
        },
      },
      { $unwind: '$userid' },
      {
        $lookup: {
          from: 'palaces',
          localField: 'palaceid',
          foreignField: '_id',
          as: 'palaceid',
        },
      },
      { $unwind: '$palaceid' },
    ]

    if (req.user.role === 'admin') {
      if (!req.user.adminid) {
        return res.status(403).json({ message: 'Admin profile not found.' })
      }
      pipeline.push({ $match: { 'palaceid.adminid': req.user.adminid } })
    }

    if (req.user.role === 'palace') {
      if (!req.user.palaceid) {
        return res.status(403).json({ message: 'Palace profile not found.' })
      }
      pipeline.push({ $match: { 'palaceid._id': req.user.palaceid } })
    }

    if (fromdate) {
      const startDate = new Date(fromdate)
      if (Number.isNaN(startDate.getTime())) {
        return res.status(400).json({ message: 'Invalid from date.' })
      }
      startDate.setHours(0, 0, 0, 0)
      pipeline.push({ $match: { checkintime: { $gte: startDate } } })
    }

    if (todate) {
      const lastDate = new Date(todate)
      if (Number.isNaN(lastDate.getTime())) {
        return res.status(400).json({ message: 'Invalid to date.' })
      }
      lastDate.setHours(23, 59, 59, 999)
      pipeline.push({ $match: { checkintime: { $lte: lastDate } } })
    }

    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      pipeline.push({ $match: { 'userid.name': { $regex: escapedSearch, $options: 'i' } } })
    }

    pipeline.push({ $sort: { checkintime: sort === 'oldest' ? 1 : -1 } })

    pipeline.push({
      $project: {
        checkintime: 1,
        checkouttime: 1,
        status: 1,
        createdAt: 1,
        'userid._id': 1,
        'userid.name': 1,
        'userid.email': 1,
        'userid.phone': 1,
        'palaceid._id': 1,
        'palaceid.name': 1,
        'palaceid.adminid': 1,
      },
    })

    const countDocument = await checkins.aggregate([...pipeline, { $count: 'totalcount' }])
    const totalcount = countDocument[0]?.totalcount || 0
    const skip = (page - 1) * limit
    pipeline.push({ $skip: skip }, { $limit: limit })

    const result = await checkins.aggregate(pipeline)
    return res.status(200).json({ result, totalcount })
  } catch (err) {
    console.error('Error loading check-ins:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatHour(hour) {
  const displayHour = hour % 12 || 12
  return `${displayHour} ${hour < 12 ? 'AM' : 'PM'}`
}

function analysePeriod(visits, days, rangeEnd) {
  const rangeStart = new Date(rangeEnd)
  rangeStart.setDate(rangeEnd.getDate() - (days - 1))
  rangeStart.setHours(0, 0, 0, 0)
  const hourly = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHour(hour),
    crowdTotal: 0,
    averageCrowd: 0,
    arrivals: 0,
  }))
  let totalCheckins = 0

  visits.forEach((visit) => {
    const visitStart = new Date(visit.checkintime)
    const visitEnd = visit.checkouttime ? new Date(visit.checkouttime) : rangeEnd

    if (visitStart >= rangeStart && visitStart <= rangeEnd) {
      hourly[visitStart.getHours()].arrivals += 1
      totalCheckins += 1
    }

    const overlapStart = new Date(Math.max(visitStart.getTime(), rangeStart.getTime()))
    const overlapEnd = new Date(Math.min(visitEnd.getTime(), rangeEnd.getTime()))
    if (overlapStart >= overlapEnd) return

    const cursor = new Date(overlapStart)
    cursor.setMinutes(0, 0, 0)
    while (cursor < overlapEnd) {
      hourly[cursor.getHours()].crowdTotal += 1
      cursor.setHours(cursor.getHours() + 1)
    }
  })

  hourly.forEach((item) => {
    item.averageCrowd = Number((item.crowdTotal / days).toFixed(days >= 30 ? 2 : 1))
    delete item.crowdTotal
  })

  const hoursWithVisits = hourly.filter((item) => item.arrivals > 0 || item.averageCrowd > 0)
  const bestTime = hoursWithVisits.length
    ? [...hoursWithVisits].sort((left, right) => left.averageCrowd - right.averageCrowd || left.arrivals - right.arrivals)[0]
    : null
  const peakTime = hoursWithVisits.length
    ? [...hoursWithVisits].sort((left, right) => right.averageCrowd - left.averageCrowd || right.arrivals - left.arrivals)[0]
    : null

  return { days, totalCheckins, hourly, bestTime, peakTime }
}

exports.getCrowdAnalytics = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')

    const palace = await palaces.findOne({
      _id: req.params.palaceid,
      activestatus: true,
      approvestatus: 'approved',
    }).select('_id')

    if (!palace) {
      return res.status(404).json({ message: 'Palace not found or unavailable.' })
    }

    const requestedDays = Number.parseInt(req.query.days, 10)
    const periodDays = [7, 30, 180].includes(requestedDays) ? requestedDays : 7
    const rangeEnd = new Date()
    const rangeStart = new Date(rangeEnd)
    rangeStart.setDate(rangeEnd.getDate() - (periodDays - 1))
    rangeStart.setHours(0, 0, 0, 0)
    const yearlyRangeStart = new Date(rangeEnd)
    yearlyRangeStart.setDate(rangeEnd.getDate() - 364)
    yearlyRangeStart.setHours(0, 0, 0, 0)

    const [currentCrowd, visits] = await Promise.all([
      checkins.countDocuments({
        palaceid: palace._id,
        status: 'checkedin',
        checkouttime: null,
      }),
      checkins.find({
        palaceid: palace._id,
        checkintime: { $lte: rangeEnd },
        $or: [
          { checkouttime: { $gte: yearlyRangeStart } },
          { checkouttime: null },
        ],
      }).select('checkintime checkouttime status').lean(),
    ])

    const daily = Array.from({ length: periodDays }, (_, index) => {
      const date = new Date(rangeStart)
      date.setDate(rangeStart.getDate() + index)
      return {
        key: toDateKey(date),
        label: periodDays === 7
          ? date.toLocaleDateString('en-US', { weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        checkins: 0,
      }
    })
    const dailyByKey = new Map(daily.map((item) => [item.key, item]))

    visits.forEach((visit) => {
      const visitStart = new Date(visit.checkintime)
      const checkinDay = dailyByKey.get(toDateKey(visitStart))
      if (checkinDay) checkinDay.checkins += 1
    })

    const weeklyAnalysis = analysePeriod(visits, 7, rangeEnd)
    const monthlyAnalysis = analysePeriod(visits, 30, rangeEnd)
    const sixMonthAnalysis = analysePeriod(visits, 180, rangeEnd)
    const yearlyAnalysis = analysePeriod(visits, 365, rangeEnd)
    const selectedAnalysis = periodDays === 30
      ? monthlyAnalysis
      : periodDays === 180
        ? sixMonthAnalysis
        : weeklyAnalysis
    const totalCheckins = selectedAnalysis.totalCheckins

    return res.status(200).json({
      currentCrowd,
      totalCheckins,
      averageDailyCheckins: Number((totalCheckins / periodDays).toFixed(1)),
      daily,
      hourly: selectedAnalysis.hourly,
      bestTime: selectedAnalysis.bestTime,
      peakTime: selectedAnalysis.peakTime,
      periodDays,
      bestTimes: {
        weekly: weeklyAnalysis.bestTime,
        monthly: monthlyAnalysis.bestTime,
        sixMonths: sixMonthAnalysis.bestTime,
        yearly: yearlyAnalysis.bestTime,
      },
      analysisTotals: {
        weekly: weeklyAnalysis.totalCheckins,
        monthly: monthlyAnalysis.totalCheckins,
        sixMonths: sixMonthAnalysis.totalCheckins,
        yearly: yearlyAnalysis.totalCheckins,
      },
      lastUpdated: new Date(),
    })
  } catch (err) {
    if (err?.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid palace id.' })
    }
    console.error('Error loading public crowd analytics:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
