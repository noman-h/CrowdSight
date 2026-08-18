const express=require('express')
const Router=express.Router()

const statecontroller=require('../Controller/StateController')

Router.post('/addstate',statecontroller.addstate)
Router.put('/updatestate',statecontroller.updatestate)
Router.get('/getallstate',statecontroller.getallstate)
Router.get('/getonestate/:id',statecontroller.getonestate)
Router.patch('/activestate',statecontroller.activestate)
Router.patch('/deactivestate',statecontroller.deactivestate)
Router.delete('/deletestate/:id',statecontroller.deletestate)



const citycontroller=require('../Controller/CityController')

Router.post('/addcity',citycontroller.addcity)
Router.put('/updatecity',citycontroller.updatecity)
Router.get('/getallcity',citycontroller.getallcities)
Router.get('/getonecity/:id',citycontroller.getonecity)
Router.patch('/activecity',citycontroller.activecity)
Router.patch('/deactivecity',citycontroller.deactivecity)
Router.delete('/deletecity/:_id',citycontroller.deletecity)


const areacontroller=require('../Controller/AreaController')

Router.post('/addarea',areacontroller.addcity)
Router.put('/updatearea',areacontroller.updatecity)
Router.get('/getallarea',areacontroller.getallareas)
Router.get('/getonearea/:id',areacontroller.getonearea)
Router.patch('/activearea',areacontroller.activearea)
Router.patch('/deactivearea',areacontroller.deactivearea)
Router.delete('/deletearea',areacontroller.deletearea)

module.exports=Router