const express=require('express')
const router=express.Router()

const qrcontroller=require('../Controller/QrController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.get('/getqr/:id',auth,authorize('palace'),qrcontroller.getqr)

router.post('/generateqr/:id',auth,authorize('palace'),qrcontroller.genratenewqr)

router.patch('/activateqr/:id',auth,authorize('palace'),qrcontroller.activate)

router.patch('/deactivateqr/:id',auth,authorize('palace'),qrcontroller.deactivate)

router.delete('/deleteqr/:id',auth,authorize('palace'),qrcontroller.delete)

module.exports=router