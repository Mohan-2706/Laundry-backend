import { Router } from 'express'
import { addUser, createAndUpdateItems, createAndUpdateOrder, createExpence, getAllCustomers, getAllDeliveryRecords, getAllExpence, getAllItems, getAllOrdersRecords, getAllUser, getOrdersWithId, getUserProfile, particularCustmrOrder, updateOrderStatus, updateUserStatus, userLogin } from '../controller/usercontroller.js'

const router = Router();

router.post('/addUser', addUser);
router.post('/login', userLogin);
router.get('/profile', getUserProfile);
router.get('/allUser', getAllUser);
router.get('/getAllCustomers', getAllCustomers);
router.post('/updateUser', updateUserStatus);
router.post('/createAndUpdateOrders', createAndUpdateOrder);
router.get('/getOrdersWithId', getOrdersWithId);
router.post('/createAndUpdateItems', createAndUpdateItems);
router.get('/allItems', getAllItems);
router.post('/getAllOrdersRecords', getAllOrdersRecords);
router.post('/updateOrderStatus', updateOrderStatus);
router.post('/particularCustmrOrder', particularCustmrOrder);
router.post('/createExpence', createExpence);
router.get('/getAllExpence', getAllExpence);
router.post('/getAllDeliveryRecords', getAllDeliveryRecords);

export default router;