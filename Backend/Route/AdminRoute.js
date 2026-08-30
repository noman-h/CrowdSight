const express=require('express')
const router=express.Router()

const AdminController=require('../Controller/AdminContoller')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addadmin',AdminController.adminadd)

router.get('/getcheckone/:id',AdminController.admincheckone)

router.put('/updateadmin/:_id',AdminController.adminupdate)

router.post('/directaddadmin',auth,authorize('superadmin'),AdminController.directadminadd)

router.get('/getalladmins',auth,authorize('superadmin'),AdminController.adminreadall)

router.get('/getoneadmin/:id',auth,authorize('superadmin'),AdminController.adminreadone)

router.get('/getuseradmin/:email',AdminController.adminbyuserone)


router.patch('/deactiveadmin/:id',auth,authorize('superadmin'),AdminController.adminsoftdelete)

router.patch('/activeadmin/:id',auth,authorize('superadmin'),AdminController.adminrecoverdelete)

router.delete('/deleteadmin/:id',auth,authorize('superadmin'),AdminController.admindelete)

router.patch('/approveadmin',auth,authorize('superadmin'),AdminController.adminapprove)

router.patch('/rejectadmin',auth,authorize('superadmin'),AdminController.adminreject)

router.post('/adminemailotpsend',AdminController.emailotpsend)

router.patch('/adminotpsend',AdminController.updateotpsend)

router.patch('/adminotpverify',AdminController.updateotpverify)

module.exports=router