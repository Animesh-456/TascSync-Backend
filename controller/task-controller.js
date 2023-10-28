import employee from '../schema/employee-schema.js';
import task from '../schema/task-chema.js';
import sendmail from '../helpers/mail.js';
import updateTask from '../helpers/globalmail/update-task.js';
import assignTask from '../helpers/globalmail/asssign-task.js'
import markDone from '../helpers/globalmail/mark-done.js';

const addtask = async (tk) => {
    let data = {
        title: tk.title,
        description: tk.description,
        assignedBy: tk.assignedBy,
    }
    let create = new task(data);
    await create.save();
    return create
}


const viewtask = async (userid, status) => {
    let tasks = await task.find({ status: status, assignedTo: userid }).sort({ createdAt: -1 }).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type',
    })
    //console.log("controller task", tasks)
    return tasks
}


const viewtasks_unassigned = async (userid) => {
    let tasks = await task.find({ assignedTo: null, assignedBy: userid }).sort({ createdAt: -1 }).populate({
        path: 'assignedBy',
        select: 'fname lname email account_type',
    })
    //console.log("controller task", tasks)
    return tasks
}


const viewtasks_assigned = async (userid) => {
    let tasks = await task.find({ assignedTo: { $ne: null }, assignedBy: userid }).sort({ createdAt: -1 }).populate({
        path: 'assignedBy',
        select: 'fname lname email account_type',
    })
    console.log("controller task", tasks)
    return tasks
}

const recent_task = async (userid) => {
    let tasks = await task.find({ assignedTo: userid }).sort({ createdAt: -1 }).limit(10).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type',
    })
    console.log("controller task", tasks)
    return tasks
}

const recent_task_created = async (userid) => {
    let tasks = await task.find({ assignedBy: userid }).sort({ createdAt: -1 }).limit(10).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type',
    })
    console.log("controller task", tasks)
    return tasks
}

const viewstaskByid = async (id) => {
    let tasks = await task.find({ _id: id }).populate({
        path: 'assignedTo assignedBy',
        select: 'fname lname email account_type'
    })
    return tasks
}

const updatetask = async (tk) => {
    let result = await task.findByIdAndUpdate({ _id: tk.id }, { title: tk.title, description: tk.description }, { new: true })
    let mailtosend = await employee.findOne({ _id: result.assignedTo })
    let mail = updateTask(mailtosend.fname, result._id, result.title, result.description)
    const subject = mail.subject
    const text2 = mail.body
    sendmail(mailtosend.email, subject, text2)
    return result
}

const markdone = async (tk) => {
    let result = await task.findByIdAndUpdate({ _id: tk.params }, { status: 'complete' }, { new: true })
    let mailtosend = await employee.findOne({ _id: result.assignedBy })
    let empname = await employee.findOne({ _id: result.assignedTo })
    console.log(empname.fname)
    let mail = markDone(mailtosend.fname, result._id, result.title, result.description, empname.fname)
    const subject = mail.subject
    const text2 = mail.body
    sendmail(mailtosend.email, subject, text2)
    return result
}

const deletetask = async (tk) => {
    await task.findByIdAndDelete({ _id: tk })
}

const assigntask = async (tk) => {
    let result = await task.findByIdAndUpdate({ _id: tk.id.toString() }, { assignedTo: tk.assignedTo.toString() }, { new: true })
    let mailtosend = await employee.findOne({ _id: result.assignedTo })
    let mailfrom = await employee.findOne({ _id: result.assignedBy })
    let mail = await assignTask(mailtosend.fname, result._id, result.title, result.description, mailfrom.fname)
    const subject = mail.subject
    const text = mail.body
    await sendmail(mailtosend.email, subject, text)
    return result
}

const taskcontroller = {
    addtask,
    viewtask,
    viewstaskByid,
    updatetask,
    deletetask,
    assigntask,
    recent_task,
    markdone,
    recent_task_created, viewtasks_unassigned, viewtasks_assigned
}


export default taskcontroller