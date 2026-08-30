const reviews=require('../Model/ReviewModel')
const checkins=require('../Model/CheckInOutModel')
const mongoose=require('mongoose')

exports.getPublic = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.palaceid)) {
      return res.status(400).json({ message: 'Invalid palace id.' })
    }

    const palaceid = new mongoose.Types.ObjectId(req.params.palaceid)
    const [recentReviews, ratingSummary] = await Promise.all([
      reviews.aggregate([
        { $match: { palaceid } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'users',
            localField: 'userid',
            foreignField: '_id',
            as: 'userid',
          },
        },
        { $unwind: { path: '$userid', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            rating: 1,
            description: 1,
            createdAt: 1,
            'userid.name': 1,
          },
        },
      ]),
      reviews.aggregate([
        { $match: { palaceid } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
      ]),
    ])

    return res.status(200).json({
      result: recentReviews,
      totalReviews: ratingSummary[0]?.totalReviews || 0,
      averageRating: ratingSummary[0]?.averageRating || 0,
    })
  } catch (err) {
    console.error('Error loading public palace reviews:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

exports.getall = async (req, res) => {
  try {
    const palaceid = req.user.role === 'palace' ? req.user.palaceid : req.query.palaceid
    if (!palaceid) {
      return res.status(400).json({ message: 'Palace id is required.' })
    }

    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 10, 1), 100)
    const skip = (page - 1) * limit
    const palaceObjectId = new mongoose.Types.ObjectId(palaceid)
    const rating = Number.parseInt(req.query.rating, 10)
    const search = req.query.search?.trim()
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1, createdAt: -1 },
      lowest: { rating: 1, createdAt: -1 },
    }

    const pipeline = [
      { $match: { palaceid: palaceObjectId } },
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: '_id',
          as: 'userid',
        },
      },
      { $unwind: { path: '$userid', preserveNullAndEmptyArrays: true } },
    ]

    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      pipeline.push({ $match: { rating } })
    }

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      pipeline.push({
        $match: {
          $or: [
            { description: { $regex: escapedSearch, $options: 'i' } },
            { 'userid.name': { $regex: escapedSearch, $options: 'i' } },
          ],
        },
      })
    }

    pipeline.push(
      { $sort: sortOptions[req.query.sort] || sortOptions.newest },
      {
        $facet: {
          result: [
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                rating: 1,
                description: 1,
                createdAt: 1,
                'userid._id': 1,
                'userid.name': 1,
              },
            },
          ],
          metadata: [{ $count: 'totalcount' }],
        },
      },
    )

    const [pageResult, ratingSummary] = await Promise.all([
      reviews.aggregate(pipeline),
      reviews.aggregate([
        { $match: { palaceid: palaceObjectId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 },
            ratings: { $push: '$rating' },
          },
        },
      ]),
    ])

    const summary = ratingSummary[0]
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    summary?.ratings?.forEach((value) => {
      if (ratingCounts[value] !== undefined) ratingCounts[value] += 1
    })

    return res.status(200).json({
      result: pageResult[0]?.result || [],
      totalcount: pageResult[0]?.metadata?.[0]?.totalcount || 0,
      totalReviews: summary?.totalReviews || 0,
      averageRating: summary?.averageRating || 0,
      ratingCounts,
    })
  } catch (err) {
    console.error('Error loading palace reviews:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

function getReviewValues(body) {
  const rating = Number.parseInt(body.rating, 10)
  const description = typeof body.description === 'string' ? body.description.trim() : ''

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5.' }
  }

  if (description.length > 2000) {
    return { error: 'Review must be 2000 characters or less.' }
  }

  return { rating, description }
}

exports.addreview = async (req, res) => {
  try {
    const values = getReviewValues(req.body)
    if (values.error) return res.status(400).json({ message: values.error })

    if (!mongoose.Types.ObjectId.isValid(req.body.checkinid)) {
      return res.status(400).json({ message: 'A valid check-in is required.' })
    }

    const checkin = await checkins.findOne({
      _id: req.body.checkinid,
      userid: req.user._id,
      status: 'checkedout',
    })

    if (!checkin) {
      return res.status(403).json({ message: 'You can only review your completed check-ins.' })
    }

    const existingReview = await reviews.findOne({ checkinid: checkin._id })
    if (existingReview) {
      return res.status(409).json({ message: 'A review already exists for this check-in.' })
    }

    const review = await reviews.create({
      ...values,
      palaceid: checkin.palaceid,
      userid: req.user._id,
      checkinid: checkin._id,
    })

    return res.status(201).json({ message: 'Review added successfully.', review })
  } catch (err) {
    console.error('Error adding review:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

exports.updatereview = async (req, res) => {
  try {
    const values = getReviewValues(req.body)
    if (values.error) return res.status(400).json({ message: values.error })

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id.' })
    }

    const review = await reviews.findOneAndUpdate(
      { _id: req.params.id, userid: req.user._id },
      values,
      { new: true, runValidators: true },
    )

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' })
    }

    return res.status(200).json({ message: 'Review updated successfully.', review })
  } catch (err) {
    console.error('Error updating review:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}

exports.deletereview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid review id.' })
    }

    const review = await reviews.findOneAndDelete({
      _id: req.params.id,
      userid: req.user._id,
    })

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' })
    }

    return res.status(200).json({ message: 'Review deleted successfully.' })
  } catch (err) {
    console.error('Error deleting review:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
}
