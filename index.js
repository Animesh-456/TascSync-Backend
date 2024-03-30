import express from "express";
import dotenv from "dotenv"
import Connection from "./database/db.js";
import bodyParser from "body-parser";
import Routes from "./server/route.js"

import newRoute from "./server/newRoute.js"

import TaskRoutes from "./server/taskRoutes.js"
import newTaskroutes from './server/newTaskRoutes.js'
import cors from 'cors';
const app = express();
dotenv.config();
Connection();

app.use(cors());
app.use("/", newRoute)
// app.use('/task', TaskRoutes)
app.use('/task', newTaskroutes)
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(4000, () => console.log("Server started at port 4000"));