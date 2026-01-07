import express from 'express';
import routes from "./route/routes.js";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import connectDB from "./utils/db.js";
const app = express();

//use
app.use(
    cors({
        origin: "http://localhost:3000", // your Next.js origin
        credentials: true,
    })
);
app.use(express.json());
app.use('/login',routes);
app.use(express.urlencoded({ extended: true }));


//method
app.get('/',function (req,res){
    res.send('index');
})


//listen
connectDB().then(()=>{
app.listen(8080, () => {
    console.log('Server started on port 8080');
})}
)