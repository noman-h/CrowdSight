const express=require('express')
const router=express.Router()

const PalaceController=require('../Controller/PalaceController')

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

router.post('/addpalace',PalaceController.addpalace)

router.get('/getcheckone/:id',PalaceController.palacecheckone)

router.put('/updatepalace/:_id',PalaceController.updatepalace)

router.post('/directaddpalace',auth,authorize('superadmin','admin'),PalaceController.directpalaceadd)

router.get('/getallpalaces',PalaceController.palacereadall)

router.get('/getonepalace/:id',PalaceController.palacereadone)

router.patch('/deactivepalace/:id',auth,authorize('superadmin','admin'),PalaceController.palacesoftdelete)

router.patch('/activepalace/:id',auth,authorize('superadmin','admin'),PalaceController.palacerecoverdelete)

router.delete('/deletepalace/:id',auth,authorize('superadmin','admin'),PalaceController.palacedelete)

router.patch('/approvepalace',auth,authorize('superadmin','admin'),PalaceController.palaceapprove)

router.patch('/rejectpalace',auth,authorize('superadmin','admin'),PalaceController.palacereject)

router.post('/palaceemailotpsend',PalaceController.emailotpsend)

router.patch('/palacenotpsend',PalaceController.updateotpsend)

router.patch('/palaceotpverify',PalaceController.updateotpverify)

router.delete('/imagedelete/:id',auth,authorize('superadmin','admin'),PalaceController.deleteimage)

module.exports=router