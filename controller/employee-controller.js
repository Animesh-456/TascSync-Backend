import { model } from 'mongoose';
import employee from '../schema/employee-schema.js';
import task from '../schema/task-chema.js';
import bcrypt from 'bcrypt'
import Jwt from 'jsonwebtoken';
import registerMail from '../helpers/globalmail/register-mail.js';
import sendmail from '../helpers/mail.js';
const addemployee = async (emp) => {
    let newEmployee = null;

    let user = await employee.findOne({
        email: emp.email
    })


    let data = {
        fname: emp.fname,
        lname: emp.lname,
        email: emp.email,
        account_type: emp.account_type,
        username: emp.username,
        description: "",
        password: ""
    }
    await bcrypt.hash(emp.password, 10).then(async function (hash) {
        data.password = hash
        newEmployee = new employee(data);
        await newEmployee.save();
        console.log(newEmployee)
        let mail = registerMail(newEmployee.fname, newEmployee._id, newEmployee.lname, newEmployee.account_type, newEmployee.username)
        const subject = mail.subject
        const text = mail.body
        sendmail(newEmployee.email, subject, text)
    });


    return newEmployee
}

const loginemployee = async (emp) => {
    let token;
    let resp = false
    let data = {
        email: emp.email,
        password: emp.password
    }

    console.log(data)
    const usr = await employee.findOne({ email: data.email })
    if (usr) {
        resp = await bcrypt.compare(data.password, usr.password)
        if (resp == true) {
            token = await Jwt.sign(usr?.id, process.env.SECRET)
            console.log("JSONWEBTOKEN", token)
        }
    }

    return { resp, usr, token }
}

const getemployeedetails = async (emp) => {
    const user = await employee.findOne({ email: emp.email })
    return user
}

const updateemployeedetails = async (emp) => {

    let obj = {
        fname: emp.fname,
        lname: emp.lname,
        description: emp.description
    }
    let result = await employee.updateOne({ email: emp.email }, { $set: obj })
    return result
}

const searchusers = async (q) => {

    if (q?.includes(" ")) {
        let str = q?.split(" ");
        let fname = str[0];
        let lname = str[1];
        let result = await employee.find({
            account_type: "Employee",
            fname: fname?.charAt(0).toUpperCase() + fname.slice(1),
            lname: lname?.charAt(0).toUpperCase() + lname.slice(1),
        })
        return result
    } else {
        let result = await employee.find({
            account_type: "Employee",
            fname: q?.charAt(0).toUpperCase() + q.slice(1)
        })
        return result
    }
}

const empcontroller = {
    addemployee,
    loginemployee,
    getemployeedetails,
    updateemployeedetails,
    searchusers
}

export default empcontroller
