import { customerOrders, customers, items, users } from "../model/userschema.js"
import { getObjString } from "../../server.js";

const addUser = async (req, res) => {

    try {
        const superUser = await users.findOne({ _id: await getObjString(req.headers.id) })
        if (superUser.role != 1) return await res.send({ status: false, message: 'New user can add only by the super user', data: null });
        const userData = await users.findOne({ user_name: req?.body?.user_name });
        if (userData) return await res.send({ status: false, message: 'User name is already exist', data: null });
        await users.create(req.body);
        return await res.status(200).send({ status: true, message: 'User added successfully', data: null });
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }

}

const userLogin = async (req, res) => {
    try {
        let { user_name, password } = req.body;
        const userData = await users.findOne({ user_name: req?.body?.user_name });
        if (userData) {
            if (userData.isDeleted) return await res.send({ status: false, message: 'This username is not exist', data: null });
            if (!userData.isActive) return await res.send({ status: false, message: 'This user doesn`t have access to login', data: null });
            if (userData.user_name == user_name && userData.password == password) {
                return await res.status(200).send({ status: true, message: 'Logged in successfully', data: { token: userData._id } });
            } else {
                return await res.send({ status: false, message: 'Invalid username or password try again later', data: null });
            }
        } else {
            return await res.send({ status: false, message: 'Invalid username or password try again later', data: null });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const userData = await users.findOne({ _id: await getObjString(req.headers.id) }, { user_name: 1, isActive: 1, isDeleted: 1, role: 1 });
        if (userData) {
            return await res.status(200).send({ status: true, message: 'Profile datas of user', data: userData });
        } else {
            return await res.send({ status: false, message: 'Not a verified user', data: null });
        }
    } catch (error) {
        // await res.send({ status: false, message: 'Not a verified user', data: null });
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

const getAllUser = async (req, res) => {
    try {
        const requestingUser = await users.findOne({ _id: await getObjString(req.headers.id), role: 1 });
        if (!requestingUser) {
            return res.status(404).send({ status: false, message: 'Un Authorized User', data: [] });
        }
        const userData = await users.find({ role: { $ne: 1 }, isDeleted: false }).sort({ user_name: 1 });
        if (!userData || userData.length === 0) {
            return res.status(404).send({ status: false, message: 'No users found', data: [] });
        }
        return res.status(200).send({ status: true, message: 'All user data', data: userData });
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

const updateUserStatus = async (req, res) => {
    try {
        const requestingUser = await users.findOne({ _id: await getObjString(req.headers.id), role: 1 });
        if (!requestingUser) {
            return res.status(404).send({ status: false, message: 'Un Authorized User', data: [] });
        }
        let userData
        if (req.body.type == 'Access') {
            userData = await users.findOneAndUpdate({ _id: await getObjString(req.body.user_id), role: { $ne: 1 }, isDeleted: false }, { isActive: req.body.status });
            if (userData) return await res.status(200).send({ status: true, message: 'User details updated successfully', data: null });
        }
        if (req.body.type == 'Delete') {
            userData = await users.findOneAndUpdate({ _id: await getObjString(req.body.user_id), role: { $ne: 1 }, isDeleted: false }, { isDeleted: req.body.status });
            if (userData) return await res.status(200).send({ status: true, message: 'User details updated successfully', data: null });
        }

        if (!userData) {
            return res.status(404).send({ status: false, message: 'No users found', data: null });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

const createAndUpdateOrder = async (req, res) => {
    try {
        const creator = await users.findOne({ _id: await getObjString(req.headers.id), isActive: true, isDeleted: false });
        if (!creator) {
            return await res.status(200).send({ status: false, message: 'Un authorized user', data: null });
        }
        const reqData = req.body;
        const bill_no = await randomNumberGenerate();
        if (reqData.type === "create") {
            const customerData = {
                kuri: reqData.kuri,
                user_name: reqData.user_name,
                phone_no: reqData.phone_no,
                address: reqData.address,
                created_by: req.headers.id
            }
            const userData = await customers.create(customerData);
            if (userData) {
                await reqData.orders.map(async val => {
                    val.user_kuri = reqData.kuri;
                    val.created_by = req.headers.id;
                    val.bill_no = bill_no
                    await customerOrders.create(val)
                })
                return await res.status(200).send({ status: true, message: 'Order created successfully', data: null });
            }
        } else if (reqData.type === "update") {
            await reqData.orders.map(async val => {
                await customerOrders.findOneAndUpdate({ _id: await getObjString(val._id) }, { ...val })
            })
            return await res.status(200).send({ status: true, message: 'Order details updated successfully', data: null });
        } else {
            await reqData.orders.map(async val => {
                val.user_kuri = reqData.kuri;
                val.created_by = req.headers.id;
                val.bill_no = bill_no
                await customerOrders.create(val)
            })
            return await res.status(200).send({ status: true, message: 'Order created successfully', data: null });
        }

    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

async function randomNumberGenerate() {
    let randomNo = Math.floor(1000 + Math.random() * 9000);
    const existBill = await customers.findOne({ bill_no: randomNo });
    if (existBill) { randomNumberGenerate() } else { return randomNo };
}

const getOrdersWithId = async (req, res) => {
    try {
        const creator = await users.findOne({ _id: await getObjString(req.headers.id), isActive: true, isDeleted: false });
        if (!creator) {
            return await res.status(200).send({ status: false, message: 'Un authorized user', data: null });
        }
        const userData = await customers.findOne({ kuri: req.query.kuri })
        const orders = await customerOrders.find({ bill_no: req.query.bill_no });
        if (orders.length && userData) {
            const sendData = {
                bill_no: req.query.bill_no,
                kuri: userData.kuri,
                user_name: userData.user_name,
                phone_no: userData.phone_no,
                address: userData.address,
                orders
            }
            return await res.status(200).send({ status: true, message: 'Orders fetched successfully', data: sendData });
        }
        if (!orders.length || userData) return await res.status(200).send({ status: false, message: 'No orders found', data: [] });
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }

}

const createAndUpdateItems = async (req, res) => {
    try {
        const creator = await users.findOne({ _id: await getObjString(req.headers.id), isActive: true, isDeleted: false, role: 1 });
        if (!creator) {
            return await res.status(200).send({ status: false, message: 'Un authorized user', data: null });
        }
        if (req?.body?.itemId) {
            const itemData = await items.findOneAndUpdate({ _id: await getObjString(req?.body?.itemId) }, { ...req?.body })
            if (itemData) return await res.status(200).send({ status: true, message: 'Items Updated successfully', data: null });
        } else {
            await items.create(req?.body);
            return await res.status(200).send({ status: true, message: 'Items created successfully', data: null });
        }
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', error: error.message });
    }
}

const getAllItems = async (req, res) => {
    try {
        const creator = await users.findOne({ _id: await getObjString(req.headers.id), isActive: true, isDeleted: false, role: 1 });
        if (!creator) {
            return await res.status(200).send({ status: false, message: 'Un authorized user', data: null });
        }
        const allItems = await items.find({ isDeleted: false });
        return await res.status(200).send({ status: true, message: 'Items fetched successfully', data: allItems });
    } catch (error) {
        return res.status(500).send({ status: false, message: 'Server error', data: error.message });
    }
}

const getAllOrdersRecords = async (req, res) => {

    try {
        const creator = await users.findOne({ _id: await getObjString(req.headers.id), isActive: true, isDeleted: false });
        if (!creator) {
            return await res.status(200).send({ status: false, message: 'Un authorized user', data: null });
        }

        const reqData = req?.body
        const results = await customerOrders.aggregate([
            {
                $match: await matchCondition(reqData.type, reqData)
                // you can also match date range/url params if needed
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'user_kuri',
                    foreignField: 'kuri',
                    as: 'customerInfo'
                }
            },
            { $unwind: '$customerInfo' },
            {
                $project: {
                    dateOnly: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    createdAt: 1,
                    bill_no: 1,
                    user_name: '$customerInfo.user_name',
                    phone_no: '$customerInfo.phone_no',
                    address: '$customerInfo.address',
                    kuri: '$customerInfo.kuri',
                    item: 1,
                    amount: 1,
                    quantity: 1,
                    total: 1,
                    isDeleted: 1,
                    isSaved: 1,
                    isConfirmed: 1,
                    created_by: 1,
                    washing: 1,
                    ironing: 1,
                    packing: 1,
                    delivery: 1
                }
            },
            {
                $group: {
                    _id: {
                        date: '$dateOnly',
                        bill_no: '$bill_no',
                        user_name: '$user_name',
                        phone_no: '$phone_no',
                        address: '$address',
                        kuri: '$kuri'
                    },
                    orders: {
                        $push: {
                            item: '$item',
                            amount: '$amount',
                            quantity: '$quantity',
                            total: '$total',
                            isDeleted: '$isDeleted',
                            isSaved: '$isSaved',
                            isConfirmed: '$isConfirmed',
                            createdBy: '$created_by',
                            washing: '$washing',
                            ironing: '$ironing',
                            packing: '$packing',
                            delivery: '$delivery',
                            createdAt: '$createdAt'
                        }
                    },
                    overAllTotal: { $sum: '$total' }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id.date',
                    bill_no: '$_id.bill_no',
                    user_name: '$_id.user_name',
                    phone_no: '$_id.phone_no',
                    address: '$_id.address',
                    kuri: '$_id.kuri',
                    orders: 1,
                    overAllTotal: 1
                }
            }
        ]);
        if (results) {
            return await res.status(200).send({ status: true, message: 'Items fetched successfully', data: results });
        } else {
            return await res.send({ status: false, message: 'No orders found', data: [] });
        }

    } catch (err) {
        return res.status(500).send({ status: false, message: 'Server error', data: error.message });
    }
};

async function matchCondition(type, data) {
    const match = {};

    // always exclude deleted orders
    match.isDeleted = false;

    // common filters present in many types
    if (data.kuri) {
        match.user_kuri = data.kuri;
    }
    if (data.bill_no) {
        match.bill_no = data.bill_no;
    }

    // date range filter if startDate / endDate provided
    if (data.startDate || data.endDate) {
        match.createdAt = {};
        if (data.startDate) {
            const sd = new Date(data.startDate);
            // optionally set time to start of day
            match.createdAt.$gte = sd;
        }
        if (data.endDate) {
            const ed = new Date(data.endDate);
            // optionally set to end of day
            match.createdAt.$lte = ed;
        }
    }

    switch (type) {
        case 'save':
            // “save” means not confirmed yet
            match.isConfirmed = false;
            break;

        case 'confirm':
            // confirmed ones
            match.isConfirmed = true;
            break;

        // you can add more types like packing, delivery similarly
        default:
            // default is everything non‑deleted (and maybe you want both confirmed and non)
            match.isConfirmed = true;
            // only those with a washing or ironing or packing or delivery date (non-null)
            if (type == 'ironing') {
                match.wsStatus = { $eq: true }
            } else if (type == 'packing') {
                match.irnStatus = { $eq: true }
            } else {
                match.pkStatus = { $eq: true }
            }
            match[type] = { $eq: null };
            break;
    }

    return match;
}



export {
    addUser,
    userLogin,
    getUserProfile,
    getAllUser,
    updateUserStatus,
    createAndUpdateOrder,
    createAndUpdateItems,
    getAllItems,
    getOrdersWithId,
    getAllOrdersRecords
}