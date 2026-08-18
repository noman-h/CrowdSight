import React, { useEffect, useState } from 'react'

function UseDebouncing(value,time) {
    

    const [debouncedvalue,setdebouncedvalue]=useState(value)

    useEffect(()=>{

        setTimeout(() => {
            setdebouncedvalue(value)
        }, time);

    },[value])

  return debouncedvalue
}

export default UseDebouncing