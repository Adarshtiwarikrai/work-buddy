import { useEffect,useState } from "react";
import { useNavigate } from "react-router";
import HomeIcon from '@mui/icons-material/Home';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ExploreIcon from '@mui/icons-material/Explore';
import SearchIcon from '@mui/icons-material/Search';
const Home=()=>{
  const navigate = useNavigate();
 const handlecanva=()=>{
   navigate('/canvas')
 }
  return (
    <div className="flex justify-center items-center h-screen ">
        
      <div className="h-full w-[25%] border flex flex-col items-center gap-12">
      <div className="h-[10%] w-full border-2 border-black ">

        <h3>adarsh tiwari</h3>
      </div>
      <div className="h-full w-full  flex flex-col items-center gap-4">
      <div className="h-10 w-[90%] border flex items-center gap-4 hover:bg-gray-200 border border-gray-200 "> 
        <SearchIcon/>
        <input
        type='text'
        placeholder="Search"
        className="w-[90%] h-10 bg=transparent border-none rounded hover:bg-gray-200 border-none"
        />
        </div>
          <div className="h-10 w-[90%]  flex items-center gap-4 hover:bg-gray-200 border border-gray-200"> 
            <ExploreIcon/>
            Explore
        </div>
         <div className="h-10 w-[90%]  flex items-center gap-4 hover:bg-gray-200 border border-gray-200 "> 
            <HomeIcon/>
            Home
        </div>
        <div className="h-10 w-[90%]  flex items-center gap-4 hover:bg-gray-200 border border-gray-200"> 
           <AccessTimeIcon/>
            Recent
        </div>
        <div className="h-10 w-[90%]  flex items-center gap-4 hover:bg-gray-200 "> 
           <StarBorderIcon/>
            Starred
        </div>
        </div>
        
    </div>
      <div className="h-full w-[75%]">
        <button className="bg-blue-400 text-white rounded m-2 px-2 py-2" onClick={handlecanva}>Add Canva</button>
      </div>
    </div>
  )
}
export default Home;