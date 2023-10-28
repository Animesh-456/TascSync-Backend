import empcontroller from '../controller/employee-controller.js';
import taskcontroller from '../controller/task-controller.js';
import express from 'express';
import bodyParser from 'body-parser';
import empauth from '../middleware/empauth.js'

import crypto from 'crypto';
import { error } from 'console';
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post('/register', async (req, res) => {
    const employee = req.body;


    await empcontroller.addemployee(employee).then(user => {

        res.status(201).json(user)

    }).catch(error => {
        res.status(500).json(error)
    })
});

router.post('/login', async (req, res) => {
    const employee = req.body;
    await empcontroller.loginemployee(employee).then(user => {
        console.log("route log", user.resp, user.usr)
        res.status(201).json(user)
    }).catch(error => {
        console.log("route error", error)
        res.status(500).json(error)
    })
});

//check this api
router.get('/getempdetails', empauth, async (req, res) => {
    await empcontroller.getemployeedetails(req.query).then(user => {
        let obj = {
            fname: `${String(user.fname)}`,
            lname: `${String(user.lname)}`,
            email: `${String(user.email)}`,
            description: `${String(user.description)}`,
            account_type: `${String(user.account_type)}`,
        }
        res.status(200).json(obj)
    }).catch(error => {
        res.status(500).json(error)
    })
})

router.get('/searchusers', async(req, res)=>{
    console.log("The search body is",req.query?.q)
    await empcontroller.searchusers(req.query?.q).then(user=>{
        console.log("search users", user)
        res.status(200).json(user)
    }).catch(error=>{
        res.status(500).json(error)
    })
})

router.post('/postemployeedetails', async (req, res) => {

    console.log("body to update", req.body)
    await empcontroller.updateemployeedetails(req.body).then(user => {
        res.status(201).json(user)
    }).catch(error => {
        res.status(500).json(error)
    })
})

router.get("/plain", async (req, res) => {
    function hashPassword(password) {
        const hash = crypto.createHash('md5');
        hash.update(password);
        const hashedPassword = hash.digest('hex');
        return hashedPassword;
    }

    function verifyPassword(plainTextPassword, hashedPassword) {
        const hashedPlainTextPassword = hashPassword(plainTextPassword);
        return hashedPlainTextPassword === hashedPassword;
    }

    // Example usage
    const plainTextPassword = 'User@123';
    const hashedPasswordFromDatabase = '448ddd517d3abb70045aea6929f02367'; // Example MD5 hashed password from the database

    const isMatch = verifyPassword(plainTextPassword, hashedPasswordFromDatabase);

    console.log("crypt veryfy is", isMatch);
    res.status(200).json(isMatch)
})

export default router;