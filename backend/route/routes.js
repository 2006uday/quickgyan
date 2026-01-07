import express from "express";
import loginPost from "../controllers/loginPost.js";
import userPost from "../controllers/userPost.js";
const routes = express.Router();

routes.
    post('/', loginPost ).
    post('/user-register',userPost);

export default routes;