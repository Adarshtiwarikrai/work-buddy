import { useEffect, useState } from "react";
const Join=()=>{
    return (
        <div className=" h-full w-full  bg-gray-200">

        <div className="flex justify-center items-center h-96 w-96 gap-200">
            <form className="flex flex-col gap-200 border border-transparent ">
           
            <input type='text' placeholder="password" className="h-8 w-64"/>
            <br/>
            <button type="submit" className="bg-blue-500 h-8 w-64 text-white">Join</button>
            </form>
           

        </div>
       
       </div>

    )
}
export default  Join;