import { useEffect, useState } from "react";
const Create=({onCreate})=>{
    const [value,setvalue]=useState('')
    const handlecreate=(e)=>{
        e.preventDefault()
        onCreate(value)
    }
    return (
        <div className=" h-full w-full  bg-gray-200">

        <div className="flex justify-center items-center h-96 w-96 gap-200">
            <form className="flex flex-col gap-200 border border-transparent " onSubmit={(e)=>handlecreate(e)}>
           
            <input type='text' placeholder="personal id or unique name" className="h-8 w-64" onChange={(e)=>setvalue(e.target.value)} value={value}/>
            <br/>
            <button type="submit" className="bg-blue-500 text-white h-8 w-64" >Create</button>
            </form>
           

        </div>
       
       </div>

    )
}
export default  Create;