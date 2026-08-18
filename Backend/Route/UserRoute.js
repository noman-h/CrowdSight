const express=require('express')
const Route=express.Router()

const UserController=require('../Controller/UserController')

const auth=require('../Middleware/Auth')

Route.post('/signup',UserController.singup)
Route.post('/login',UserController.login)
Route.post('/forgotpassword',UserController.forgetpass)
Route.post('/forgototpsend',UserController.forgetotpsend)
Route.post('/forgototpverify',UserController.forgetotpverify)
Route.patch('/resetpass',auth,UserController.resetpass)
Route.patch('/theme',auth,UserController.changetheme)

module.exports=Route