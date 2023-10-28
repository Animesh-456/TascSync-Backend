import jwt from "jsonwebtoken";
import employee from '../schema/employee-schema.js';
//import employee from "../schema/employee-schema";

const authmiddleware = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    let response = await jwt.verify(token, process.env.SECRET)
    let user = await employee.findOne({ _id: response })
    if (!user) {
        return res.status(500).json(user)
    }
    next()
    //return res.status(200).json(user)
}
export default authmiddleware