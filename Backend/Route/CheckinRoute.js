const express=require('express')
const router=express.Router()

const checkinout=require('../Controller/CheckinoutController')
const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/scan/:code',auth,authorize('user'),checkinout.scan)
router.get('/mine',auth,authorize('user'),checkinout.getMine)
router.get('/crowd/:palaceid',checkinout.getCrowdAnalytics)
router.get('/getall',auth,authorize('palace','admin'),checkinout.getall)

module.exports=router
