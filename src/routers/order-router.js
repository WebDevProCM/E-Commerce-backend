const express = require("express");
const Order = require("../models/order.js");
const User = require("../models/user.js");
const Product = require("../models/product.js");

const adminAuth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");
const idGenerator = require("../utilis/idGenerator.js");

const router = new express.Router();

// router.get("/orders/details/:ordId", auth, async (req, res) =>{
//     try{
//         const order = await Order.findOne({ordId: req.params.ordId});
//         if(!order){
//             return res.render("orderDetails.hbs", {title: "Order Details"});
//         }
//         await order.populate("customer",{name: 1, cusId: 1});
//         res.render("orderDetails.hbs", {title: `Order Details-${order.ordId}`, id: order.ordId, user: req.session.user});
//     }catch(error){
//         res.send({error: "something went wrong!"});
//     }
// });

//-------------------api endpoints---------------------------------------
//==================api endpoints for order and order details creation------------

// router.post("/api/order", apiAuth, async (req, res) =>{
//     req.body.ordId = idGenerator.ordIdGenerator();
//     try{
//         const user = await User.findById(req.body.user);
//         if(!user){
//             return res.send({error: "User not found!"});
//         }

//         let order = new Order(req.body);
//         if(!order){
//             return res.send({error: "Order not created!"});
//         }

//         await order.save();
//         await order.populate("customer", {name: 1, _id: 1});
//         res.send(order);
//     }catch(error){;
//         res.send({error:"something went wrong!"});
//     }
// });

router.post("/api/order", apiAuth, async (req, res) =>{
    req.body.ordId = idGenerator.ordIdGenerator();
    req.body.customer = req.session.user._id;
    console.log(req.body.customer);
    req.body.paid = "no";

    const currentDate = new Date();
    req.body.deliveryDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    try{
        const user = await User.findById(req.body.customer);
        if(!user){
            return res.send({error: "User not found!"});
        }

        // if(product.status > 1){
        //     return res.send({error: "Product not available at the moment!"});
        // }

        // if(product.quantity < parseFloat(req.body.quantity)){
        //     return res.send({error: "Not having enough quantities!"});
        // }


        // const checkExstingProduct = order.products.find(detail => detail.prodId === req.body.prodId);
        // if(checkExstingProduct){
        //     checkExstingProduct.quantity = checkExstingProduct.quantity + parseInt(req.body.quantity);
        //     checkExstingProduct.total = checkExstingProduct.quantity * checkExstingProduct.price;
        // }else{
        //     order.products.push({
        //         quantity: parseFloat(req.body.quantity),
        //         prodId: product.prodId,
        //         image: product.image,
        //         name: product.name,
        //         price: product.price,
        //         total: product.price * parseInt(req.body.quantity)
        //     });
        // }

        let totalAmount = 0;
        let errorMsg = '';
        let products = [];

        for(let i=0; i < req.body.products.length; i++){
            let ordProduct = await Product.findOne({prodId: req.body.products[i].prodId});
            if(!ordProduct){
                errorMsg = {error: "Product not Found!"};
                break;
            }

            if(ordProduct.status > 1){
                errorMsg = {error: "Product not available at the moment!"};
                break;
            }

            if(ordProduct.quantity < parseFloat(req.body.products[i].quantity)){
                errorMsg = {error: "Not having enough quantities!"};
                break;
            }

            req.body.products[i].totalAmount = ordProduct.price * req.body.products[i].quantity;
            req.body.products[i].name = ordProduct.name;
            req.body.products[i].image = ordProduct.image;
            req.body.products[i].price = ordProduct.price;
            totalAmount = totalAmount + req.body.products[i].totalAmount;
            products.push(req.body.products[i]);
        }
        
        if(errorMsg.error){
            return res.send({error: errorMsg.error});
        }
        req.body.totalAmount = totalAmount;
        req.body.products = products;

        let order = new Order(req.body);
        if(!order){
            return res.send({error: "Order not created!"});
        }

        await order.save();
        res.send(order);
    }catch(error){;
        console.log(error);
        res.send({error:"something went wrong!"});
    }
});

//==================api endpoints for getting order and order------------

router.get("/api/orders/admin", adminAuth, async (req, res) =>{
    try{
        const orders = await Order.find({}).populate("customer", {name:1, _id: 1});
        res.send(orders);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/order", apiAuth, async (req, res) =>{
    try{
        const orders = await Order.find({customer: req.session.user._id});
        if(!orders){
            return res.send({error: "Order is not found!"});
        }

        res.send(orders);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

//==================api endpoints for getting single order and order details------------
// router.get("/api/order/:id", apiAuth, async (req, res) =>{
//     try{
//         const order = await Order.findOne({ordId: req.params.id});
//         if(!order){
//             return res.send({error: "order not found!"});
//         }
//         await order.populate("customer",{name: 1, _id: 1});
//         res.send(order);
//     }catch(error){
//         res.send({error: "something went wrong!"});
//     }
// });

// router.get("/api/order/details/:ordId/:prodId", apiAuth, async (req, res) =>{
//     try{
//         const order = await Order.findOne({ordId: req.params.ordId});
//         if(!order){
//             return res.send({error: "Order not found!"});
//         }
//         const orderDetails = order.products.find((detail) =>{
//             return detail.prodId === req.params.prodId;
//         });
//         if(!orderDetails){
//             return res.send({error: "orderDetail not found!"});
//         }

//         res.send(orderDetails);
//     }catch(error){
//         res.send({error: "something went wrong!"});
//     }
// });

//==================api endpoints for updating order and order details------------
router.patch("/api/order/admin/:id", adminAuth, async (req, res) =>{
    try{
        const allowedFields = ["deliveryDate", "status", "paid"];
        const updatingFields = Object.keys(req.body);
        const validationCheck = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        });

        if(!validationCheck){
            return res.send({error: "Invalid field update!"});
        }

        const newDate = new Date(req.body.deliveryDate);
        req.body.deliveryDate = newDate;
        
        let order = await Order.findOneAndUpdate({ordId: req.params.id}, req.body, {new: true});
        if(!order){
            return res.send({error: "Order not updated!"});
        }

        await order.save();
        await order.populate("customer", {name: 1, _id: 1});
        res.send(order);
    }catch(error){
        console.log(error);
        res.send({error: "something went wrong!"});
    }
});

// router.patch("/api/order/details/:ordId/:prodId", apiAuth, async (req, res) =>{
//     try{
//         const allowedFields = ["quantity"];
//         const updatingFields = Object.keys(req.body);
//         const validationCheck = updatingFields.every((field) =>{
//             return allowedFields.includes(field);
//         });

//         if(!validationCheck){
//             return res.send({error: "Invalid field update!"});
//         }
//         let order = await Order.findOne({ordId: req.params.ordId});
//         if(!order){
//             return res.send({error: "Order not found!"});
//         }

//         let product = await Product.findOne({prodId: req.params.prodId});
//         if(!product){
//            return res.send({error: "Product not found!"});
//         }

//         let orderDetail = order.products.find((detail) =>{
//             return detail.prodId === req.params.prodId;
//         });
//         if(!orderDetail){
//             return res.send({error: "OrderDetail not found!"});
//         }

//         if(parseFloat(req.body.quantity) === orderDetail.quantity){
//             return res.send(orderDetail);
//         }

//         if(parseFloat(req.body.quantity) > orderDetail.quantity){
//             if(parseFloat(req.body.quantity) > product.quantity){
//                 return res.send({error: "Not having enough quantities!"});
//             }

//             product.quantity = product.quantity - (parseFloat(req.body.quantity) - orderDetail.quantity);
//             orderDetail.quantity = parseFloat(req.body.quantity);
//             orderDetail.total = orderDetail.price * orderDetail.quantity;
//             let totalAmount = 0;
//             order.products.forEach((product) =>{
//                 return totalAmount = totalAmount + product.total;
//             });
//             order.totalAmount = totalAmount; 
//         }else{
//             product.quantity = product.quantity + (orderDetail.quantity - parseFloat(req.body.quantity));
//             orderDetail.quantity = parseFloat(req.body.quantity);
//             orderDetail.total = orderDetail.price * orderDetail.quantity;
//             let totalAmount = 0;
//             order.products.forEach((product) =>{
//                 return totalAmount = totalAmount + product.total;
//             });
//             order.totalAmount = totalAmount; 
//         }

//         await order.save();
//         await product.save();
//         res.send(order.products.find(product => product.prodId === req.params.prodId));
//     }catch(error){
//         res.send({error: "something went wrong!"});
//     }
// });

//==================api endpoints for deleting order and order details------------
// router.delete("/api/order/:id", apiAuth, async (req, res) =>{
//     try{
//         const order = await Order.findOneAndDelete({ordId: req.params.id});
//         if(!order){
//             return res.send({error: "Order not removed!"});
//         }
//         res.send(order);
//     }catch(error){
//         res.send({error: "something went wrong!"});
//     }
// });

router.delete("/api/order/:id", adminAuth, async (req, res) =>{
    try{
        let order = await Order.findOneAndDelete({ordId: req.params.ordId});
        if(!order){
            return res.send({error: "Order not found!"});
        }

        for(let i=0; i < order.products.length(); i++){
            let ordProduct = await Product.findOne({prodId: req.body.products[i].prodId});
            if(!ordProduct){
                continue;
            }

            ordProduct.quantity = ordProduct.quantity + order.products[i].quantity;
            await ordProduct.save();
        }
        
        res.send(order);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

module.exports = router;