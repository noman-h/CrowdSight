const express=require('express')
const Router=express.Router()

const auth=require('../Middleware/Auth')
const authorize=require('../Middleware/Authorize')

const statecontroller=require('../Controller/StateController')

Router.post('/addstate',auth,authorize('superadmin'),statecontroller.addstate)
Router.put('/updatestate',auth,authorize('superadmin'),statecontroller.updatestate)
Router.get('/getallstate',statecontroller.getallstate)
Router.get('/getonestate/:id',auth,authorize('superadmin'),statecontroller.getonestate)
Router.patch('/activestate',auth,authorize('superadmin'),statecontroller.activestate)
Router.patch('/deactivestate',auth,authorize('superadmin'),statecontroller.deactivestate)
Router.delete('/deletestate/:id',auth,authorize('superadmin'),statecontroller.deletestate)



const citycontroller=require('../Controller/CityController')

Router.post('/addcity',auth,authorize('superadmin'),citycontroller.addcity)
Router.put('/updatecity',auth,authorize('superadmin'),citycontroller.updatecity)
Router.get('/getallcity',citycontroller.getallcities)
Router.get('/getonecity/:id',auth,authorize('superadmin'),citycontroller.getonecity)
Router.patch('/activecity',auth,authorize('superadmin'),citycontroller.activecity)
Router.patch('/deactivecity',auth,authorize('superadmin'),citycontroller.deactivecity)
Router.delete('/deletecity/:_id',auth,authorize('superadmin'),citycontroller.deletecity)


const areacontroller=require('../Controller/AreaController')

Router.post('/addarea',auth,authorize('superadmin'),areacontroller.addcity)
Router.put('/updatearea',auth,authorize('superadmin'),areacontroller.updatecity)
Router.get('/getallarea',areacontroller.getallareas)
Router.get('/getonearea/:id',auth,authorize('superadmin'),areacontroller.getonearea)
Router.patch('/activearea',auth,authorize('superadmin'),areacontroller.activearea)
Router.patch('/deactivearea',auth,authorize('superadmin'),areacontroller.deactivearea)
Router.delete('/deletearea/:_id',auth,authorize('superadmin'),areacontroller.deletearea)

module.exports=Router