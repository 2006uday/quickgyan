import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  
})

async function uploadResourse(req: Request, res: Response) {
    try{
        
    }   
    catch(error)
    {
        console.log(error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
