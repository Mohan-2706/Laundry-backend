import { Router } from 'express'
import { addUser, createAndUpdateItems, createAndUpdateOrder, getAllItems, getAllOrdersRecords, getAllUser, getOrdersWithId, getUserProfile, updateUserStatus, userLogin } from '../controller/usercontroller.js'

const router = Router();

router.post('/addUser', addUser);
router.post('/login', userLogin);
router.get('/profile', getUserProfile);
router.get('/allUser', getAllUser);
router.post('/updateUser', updateUserStatus);
router.post('/createAndUpdateOrders', createAndUpdateOrder);
router.get('/getOrdersWithId', getOrdersWithId);
router.post('/createAndUpdateItems', createAndUpdateItems);
router.get('/allItems', getAllItems);
router.post('/getAllOrdersRecords', getAllOrdersRecords);

export default router;