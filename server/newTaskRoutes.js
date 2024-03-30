import taskcontroller from '../controller/task-controller.js';
import express from 'express';
import bodyParser from 'body-parser';
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
import empauth from '../middleware/empauth.js'

// router.get('/users/:userId', userController.getUserById);

router.post('/addtask', taskcontroller.addtask)

router.get('/viewtasks-pending', empauth, taskcontroller.viewtaskPending)


router.get('/viewtasks-complete', empauth, taskcontroller.viewtaskComplete)

router.get('/viewtasks-unassigned', empauth, taskcontroller.viewtasks_unassigned)


router.get('/viewtasks-assigned', empauth, taskcontroller.viewtasks_assigned)


router.get('/recent-tasks', empauth, taskcontroller.recent_task)

router.get('/created-recent-tasks', empauth,  taskcontroller.recent_task_created)

router.get('/viewtaskbyid', empauth, taskcontroller.viewstaskByid)


router.post('/updatetask', taskcontroller.updatetask)


router.post('/markdone', taskcontroller.markdone)

router.post('/deletetask', taskcontroller.deletetask)

router.post('/assigntask', taskcontroller.assigntask)


export default router;