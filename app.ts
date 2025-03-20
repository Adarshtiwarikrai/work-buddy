import express from 'express'
import dotenv from 'dotenv'
import Authrouter from './routes/auth'
import cors from 'cors'
dotenv.config()
const app=express()
const port=process.env.PORT || 3000
app.use(express.json())
app.use(cors())
app.use('/auth',Authrouter)
app.listen(port,()=>console.log(`Server is running on port ${port}`))