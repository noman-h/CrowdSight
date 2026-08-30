const express = require('express')
const router = express.Router()

const reviewController = require('../Controller/ReviewController')
const auth = require('../Middleware/Auth')
const authorize = require('../Middleware/Authorize')

router.get('/public/:palaceid', reviewController.getPublic)
router.get('/getall', auth, authorize('palace', 'superadmin'), reviewController.getall)
router.post('/create', auth, authorize('user'), reviewController.addreview)
router.patch('/update/:id', auth, authorize('user'), reviewController.updatereview)
router.delete('/delete/:id', auth, authorize('user'), reviewController.deletereview)

module.exports = router
