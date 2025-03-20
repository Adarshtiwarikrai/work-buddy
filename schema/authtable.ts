import {Client } from 'pg'
const client = new Client('postgresql://neondb_owner:Bvk0KX3IxLlT@ep-young-violet-a5yinpzw-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require')
client.connect()
client.query(
    `Create Table auth(
       emailid varchar(50) not null primary key,
       username varchar(50) not null,
       password varchar(50) not null

    )`,
    (err,res)=>{
        if(err) throw err
        console.log(res.rows)
       
    }
)
client.query(
    `Create Table canvas(
    emailid varchar(50),
    canva BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (emailid, created_at)
    )`,
    (err,res)=>{
        if(err) throw err
        console.log(res.rows)
    }
)