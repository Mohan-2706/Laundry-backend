import mongoose from "mongoose";

const user = new mongoose.Schema({
    user_name: { type: String },
    password: { type: String },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    role: { type: Number, default: 2 }                                                             // 1 -> Super User , 2 -> User
}, { timestamps: true })


const customer = new mongoose.Schema({
    kuri: { type: String },
    user_name: { type: String },
    phone_no: { type: String },
    address: { type: String },
    created_by: { type: String },
}, { timestamps: true })

const customerOrder = new mongoose.Schema({
    user_kuri: { type: String },
    bill_no: { type: Number },
    created_by: { type: String },
    item: { type: String },
    quantity: { type: Number },
    amount: { type: Number },
    total: { type: Number },
    isSaved: { type: Boolean, default: true },
    isConfirmed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    washing: { type: Date, default: null },
    wsStatus: { type: Boolean, default: false },
    ironing: { type: Date, default: null },
    irnStatus: { type: Boolean, default: false },
    packing: { type: Date, default: null },
    pkStatus: { type: Boolean, default: false },
    delivery: { type: Date, default: null },
    dlvStatus: { type: Boolean, default: false },
}, { timestamps: true })

const item = new mongoose.Schema({
    item: String,
    amount: Number,
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

const users = mongoose.model('user', user);
const items = mongoose.model('item', item);
const customers = mongoose.model('customer', customer);
const customerOrders = mongoose.model('customerOrder', customerOrder);

export { users, items, customers, customerOrders }
