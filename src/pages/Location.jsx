import React from 'react'

export default function Location() {
    const getLocation=()=>{
        navigator.geolocation.getCurrentPosition((location)=>console.log(location),()=>console.log("error in getting location"))
    }
  return (
    <div>
        <button onClick={getLocation}>Get Location</button>
    </div> 
  )
}
