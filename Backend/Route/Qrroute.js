const express=require('express')
const router=express.Router()

const qrcontroller=require('../Controller/QrController')

router.get('/getqr/:id',qrcontroller.getqr)

router.post('/generateqr/:id',qrcontroller.genratenewqr)

router.patch('/activateqr/:id',qrcontroller.activate)

router.patch('/deactivateqr/:id',qrcontroller.deactivate)

router.delete('/deleteqr/:id',qrcontroller.deactivate)

module.exports=router