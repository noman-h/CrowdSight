import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function UseTheme() {

    const navigate=useNavigate()

    const [theme,settheme]=useState(localStorage.getItem('theme') || "light")

    const token=localStorage.getItem('token')

   async function themechange(){
        try{

            const result=await axios.patch(`${import.meta.env.VITE_API_URL}user/theme`,{theme},{
                headers :{
                    AUTHORIZATION:`Bearer ${token}`
                }
            })
            
        }
        catch(err){
            if(err.status===401){
      alert("session expired")           
     localStorage.removeItem("user")
     localStorage.removeItem("userid")
     localStorage.removeItem("token")
     localStorage.removeItem("email")
     localStorage.removeItem("theme")
     navigate('/login')
        }
    else {
        alert("server error",err)
    }
        }
    }

    useEffect(()=>{

        document.body.classList=theme
        localStorage.setItem("theme",theme)

        if(token){
           themechange()
        }
        
    },[theme])

    function toggletheme(){
        (theme==="light") ? settheme("dark") : settheme("light")
    }

  return {theme,toggletheme}
}

export default UseTheme