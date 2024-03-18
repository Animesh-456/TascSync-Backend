import employee from '../schema/employee-schema.js';
import task from '../schema/task-chema.js';
import sendmail from '../helpers/mail.js';
import updateTask from '../helpers/globalmail/update-task.js';
import assignTask from '../helpers/globalmail/asssign-task.js'
import markDone from '../helpers/globalmail/mark-done.js';
import { isObjectIdOrHexString } from 'mongoose';

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


const viewtasks_unassigned = async (userid, page) => {
  const pageNumber = page;
  const pageSize = 10;
  const offset = (pageNumber - 1) * pageSize;

  try {
    const tks = await task.aggregate([
      {
        $match:
        {
          $and: [
            { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
            { assignedTo: null }
          ]
        }

      },
      {
        $lookup: {
          from: "employees",
          localField: "assignedBy",
          foreignField: "_id",
          as: "assignedByDetails",
        }
      },
      {
        $project: {
          "assignedByDetails.password": 0,
        }
      },

      {
        $facet: {
          task: [
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: pageSize },
            {
              $match: {
                $and: [

                  { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
                  { assignedTo: null }
                ]
              }



            },
          ],
          totalCount: [
            { $count: 'count' }
          ]
        }
      }
    ])

    // Total Count of the documents for pagination logic
    //console.log("Actual task is : - ", tks[0])
    //console.log("tsks : -", tks[0]?.totalCount[0]?.count)




    const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
    return { tks, TotalPages }
  } catch (error) {
    console.log("catch error !")
    return
  }
}






const viewtasks_assigned = async (userid, page) => {
  // let tasks = await task.find({ assignedTo: { $ne: null }, assignedBy: userid }).sort({ createdAt: -1 }).populate({
  //   path: 'assignedBy',
  //   select: 'fname lname email account_type',
  // })
  // return tasks




  // New Logic

  const pageNumber = page || 1;
  const pageSize = 10;
  const offset = (pageNumber - 1) * pageSize;

  try {
    const tks = await task.aggregate([
      {
        $match:
        {
          $and: [
            { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
            { assignedTo: { $ne: null } }
          ]
        }

      },

      // {
      //   $lookup: {
      //     from: "employees",
      //     let: { assignedBy: '$assignedBy', assignedTo: '$assignedTo' }, // Define local variables
      //     pipeline: [
      //       {
      //         $match: {
      //           $expr: {
      //             $and: [
      //               { $eq: ['$assignedBy', '$assignedBy'] }, // Join condition for assignedBy field
      //               { $eq: ['$assgnedTo', '$assignedTo'] },
                    
      //             ]
      //           }

      //         }
      //       }
      //     ],
      //     as: "assignedDetails" // Output array field containing matching documents
      //   }
      // },

      {
        $lookup: {
          from: "employees",
          localField: "assignedBy",
          foreignField: "_id",
          as: "assignedByDetails",
        }
      },

      {
        $lookup: {
          from: "employees",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedToDetails",
        }
      },

      {
        $facet: {
          task: [
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: pageSize },
            {
              $match: {
                $and: [

                  { $expr: { $eq: ['$assignedBy', { $toObjectId: userid }] } },
                  { assignedTo: { $ne: null } }
                ]
              }



            },
          ],
          totalCount: [
            { $count: 'count' }
          ],



        },


      },




    ])

    // Total Count of the documents for pagination logic
    //console.log("Actual task is : - ", tks)
    //console.log("tsks : -", tks[0]?.totalCount[0]?.count)




    const TotalPages = Math.ceil(tks[0]?.totalCount[0]?.count / pageSize);
    return { tks, TotalPages }
  } catch (error) {
    console.log("catch error !")
    return
  }
}

const recent_task = async (userid) => {
  let tasks = await task.find({ assignedTo: userid }).sort({ createdAt: -1 }).limit(10).populate({
    path: 'assignedTo assignedBy',
    select: 'fname lname email account_type',
  })
  //console.log("controller task", tasks)
  return tasks
}

const recent_task_created = async (userid) => {
  let tasks = await task.find({ assignedBy: userid }).sort({ createdAt: -1 }).limit(10).populate({
    path: 'assignedTo assignedBy',
    select: 'fname lname email account_type',
  })
  //console.log("controller task", tasks)
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