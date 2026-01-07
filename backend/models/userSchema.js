import mongoose from 'mongoose';

const User = new mongoose.Schema(
{
        username :
            {
                type: String,
                required: true,
                trim: true
            },
        password :
            {
                type: String,
                required: true,
            },
        email :
            {
                type: String,
                required: true,
                trim: true
            },
        dob :
            {
                type : Date,
                default : new Date()
            },
        },
{
        timestamps: true
        }
)

export default mongoose.model("users", User);