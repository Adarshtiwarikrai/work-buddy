import { useEffect, useState } from "react";
import axios from "axios";

const Signup=()=>{
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const handlesignup =(e)=>{

        e.preventDefault();
        axios.post("http://localhost:3000/auth/signup",{
            username:name,
            email:email,
            password:password
        }).then((res)=>{
            console.log(res.data);
        })
    }
    return (
        <div className="flex flex-col justify-center items-center   h-screen">

       
        <div className=" h-96 w-96 text-black rounded bg-gray-200 shadow-lg flex flex-col justify-center items-center ">
        <h1 className="text-2xl font-bold">Signup</h1>
        <div className="flex justify-center items-center h-96 w-96 gap-200">
            <form className="flex flex-col gap-200 border rounded border-transparent ">
            <input type='text' placeholder="name" value={name} onChange={(e)=>setName(e.target.value)}className="h-8 w-64 bg-white border border-black-600 rounded text-black"/>
            <br/>
            <input type='text' placeholder="gmail" value= {email} onChange={(e)=>setEmail(e.target.value)} className="h-8 w-64 bg-white border border-black-600 rounded  text-black"/>
            <br/>
            <input type='text' placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="h-8 w-64 bg-white border border-black-600 rounded  text-black"/>
            <br/>
            <button type="submit" className= "bg-blue-600 rounded " onClick={(e)=>handlesignup(e)}>Signup</button>
            </form>
           

        </div>
       
       </div>
       </div>

    )
}
export default  Signup;