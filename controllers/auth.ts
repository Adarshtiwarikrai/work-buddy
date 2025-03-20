import {Client} from 'pg'
import {validator} from 'validator'
import zxcvbn from 'zxcvbn'
const client= new Client('postgresql://neondb_owner:Bvk0KX3IxLlT@ep-young-violet-a5yinpzw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require')
client.connect()
export const signup=async (req,res)=>{
    try{
        const {username,password,email}=req.body
        const query=`Insert into auth (emailid ,username ,password) values($1,$2,$3)`
        const value=[email,username,password]
        if(zxcvbn(password).score<=2){
            res.status(400).json({
                message:'password is weak',
                data:'try better password'
            })
            return ;
        }
        if(validator.isEmail(email)&&email.endsWith('@gmail.com')){
        const result =await client.query(query,value)
        res.status(200).json({
            message:'success',
            data:[
                username,
                email,
                password
            ]
        })
        }
    }
    catch(err){
        res.status(200).json({
            message:'success',
            data:'signup failed'
        })
    }
}
export const login = async (req,res)=>{
    try{
        console.log('login')
        const {email,password}=req.body
        const query =`Select * from auth where emailid=$1 and password=$2`
        const value=[email,password]
        const result = await client.query(query,value)
        if(result.rows.length>0){
            res.send(result.rows[0])
            console.log(result)
            console.log('found')
        }
        else{
            res.status(404).json({
                message:'failed',
                data:'login failed user not found '
            })
        }
    }
    catch(err){
        res.status(404).json({
            message:'failed',
            data:'login failed '
        })
    }
}
//dabbutiwari91@gmail.com
//