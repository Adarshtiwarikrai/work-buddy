import express from 'express';
import  {signup,login} from '../controllers/auth'
const Authrouter=express.Router()
Authrouter.post('/signup',signup)
Authrouter.post('/login',login)
export default Authrouter;