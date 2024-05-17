const express = require("express");
const Order = require("../models/order.js");
const User = require("../models/user.js");
const Product = require("../models/product.js");

const auth = require("../middleware/auth.js");
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
router.post("/api/order", apiAuth, async (req, res) =>{
    req.body.ordId = idGenerator.ordIdGenerator();
    try{
        const user = await User.findById(req.body.user);
        if(!user){
            return res.send({error: "User not found!"});
        }

        let order = new Order(req.body);
        if(!order){
            return res.send({error: "Order not created!"});
        }

        await order.save();
        await order.populate("customer", {name: 1, _id: 1});
        res.send(order);
    }catch(error){;
        res.send({error:"something went wrong!"});
    }
});

router.post("/api/order/details", apiAuth, async (req, res) =>{
    try{
        let product = await Product.findOne({prodId: req.body.prodId});
        if(!product){
            return res.send({error: "product not found!"});
        }

        let order = await Order.findOne({ordId: req.body.ordId});
        if(!order){
            return res.send({error: "Order not found!"});
        }

        if(product.status > 1){
            return res.send({error: "Product not available at the moment!"});
        }

        if(product.quantity < req.body.quantity){
            return res.send({error: "Not having enough quantities!"});
        }

        const checkExstingProduct = order.products.find(detail => detail.prodId === req.body.prodId);
        if(checkExstingProduct){
            checkExstingProduct.quantity = checkExstingProduct.quantity + parseInt(req.body.quantity);
            checkExstingProduct.total = checkExstingProduct.quantity * checkExstingProduct.price;
        }else{
            order.products.push({
                quantity: req.body.quantity,
                prodId: product.prodId,
                image: product.image,
                name: product.name,
                price: product.price,
                total: product.price * parseInt(req.body.quantity)
            });
        }

        let totalAmount = 0;
        order.products.forEach((product) =>{
            return totalAmount = totalAmount + product.total;
        });
        order.totalAmount = totalAmount; 

        product.quantity = product.quantity - req.body.quantity;

        await order.save();
        await product.save();
        res.send(order.products.find(product => product.prodId === req.body.prodId));
    }catch(error){;
        res.send({error:"something went wrong!"});
    }
});

//==================api endpoints for getting order and order------------
router.get("/api/order", apiAuth, async (req, res) =>{
    try{
        const orders = await Order.find({}).populate("customer", {name:1, _id: 1});
        res.send(orders);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/order/details/:ordId", apiAuth, async (req, res) =>{
    try{
        const order = await Order.findOne({ordId: req.params.ordId});
        if(!order){
            return res.send({error: "Order is not found!"});
        }
        const orderDetails = order.products;
        res.send(orderDetails);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

//==================api endpoints for getting single order and order details------------
router.get("/api/order/:id", apiAuth, async (req, res) =>{
    try{
        const order = await Order.findOne({ordId: req.params.id});
        if(!order){
            return res.send({error: "order not found!"});
        }
        await order.populate("customer",{name: 1, _id: 1});
        res.send(order);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.get("/api/order/details/:ordId/:prodId", apiAuth, async (req, res) =>{
    try{
        const order = await Order.findOne({ordId: req.params.ordId});
        if(!order){
            return res.send({error: "Order not found!"});
        }
        const orderDetails = order.products.find((detail) =>{
            return detail.prodId === req.params.prodId;
        });
        if(!orderDetails){
            return res.send({error: "orderDetail not found!"});
        }

        res.send(orderDetails);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

//==================api endpoints for updating order and order details------------
router.patch("/api/order/:id", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["orderDate", "deliveryDate", "paid", "status"];
        const updatingFields = Object.keys(req.body);
        const validationCheck = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        });

        if(!validationCheck){
            return res.send({error: "Invalid field update!"});
        }
        let order = await Order.findOneAndUpdate({ordId: req.params.id}, req.body, {new: true});
        if(!order){
            return res.send({error: "Order not updated!"});
        }

        await order.save();
        await order.populate("customer", {name: 1, _id: 1});
        res.send(order);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.patch("/api/order/details/:ordId/:prodId", apiAuth, async (req, res) =>{
    try{
        const allowedFields = ["quantity"];
        const updatingFields = Object.keys(req.body);
        const validationCheck = updatingFields.every((field) =>{
            return allowedFields.includes(field);
        });

        if(!validationCheck){
            return res.send({error: "Invalid field update!"});
        }
        let order = await Order.findOne({ordId: req.params.ordId});
        if(!order){
            return res.send({error: "Order not found!"});
        }

        let product = await Product.findOne({prodId: req.params.prodId});
        if(!product){
           return res.send({error: "Product not found!"});
        }

        let orderDetail = order.products.find((detail) =>{
            return detail.prodId === req.params.prodId;
        });
        if(!orderDetail){
            return res.send({error: "OrderDetail not found!"});
        }

        if(req.body.quantity === orderDetail.quantity){
            return res.send(orderDetail);
        }

        if(req.body.quantity > orderDetail.quantity){
            if(req.body.quantity > product.quantity){
                return res.send({error: "Not having enough quantities!"});
            }

            product.quantity = product.quantity - (req.body.quantity - orderDetail.quantity);
            orderDetail.quantity = req.body.quantity;
            orderDetail.total = orderDetail.price * orderDetail.quantity;
            let totalAmount = 0;
            order.products.forEach((product) =>{
                return totalAmount = totalAmount + product.total;
            });
            order.totalAmount = totalAmount; 
        }else{
            product.quantity = product.quantity + (orderDetail.quantity - req.body.quantity);
            orderDetail.quantity = req.body.quantity;
            orderDetail.total = orderDetail.price * orderDetail.quantity;
            let totalAmount = 0;
            order.products.forEach((product) =>{
                return totalAmount = totalAmount + product.total;
            });
            order.totalAmount = totalAmount; 
        }

        await order.save();
        await product.save();
        res.send(order.products.find(product => product.prodId === req.params.prodId));
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

//==================api endpoints for deleting order and order details------------
router.delete("/api/order/:id", apiAuth, async (req, res) =>{
    try{
        const order = await Order.findOneAndDelete({ordId: req.params.id});
        if(!order){
            return res.send({error: "Order not removed!"});
        }
        res.send(order);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

router.delete("/api/order/details/:ordId/:prodId", apiAuth, async (req, res) =>{
    try{
        let order = await Order.findOne({ordId: req.params.ordId});
        if(!order){
            return res.send({error: "Order not found!"});
        }

        let product = await Product.findOne({prodId: req.params.prodId});

        const removedProduct = order.products.find(product => product.prodId == req.params.prodId);
        const oldProductsLength = order.products.length;
        order.products = order.products.filter((detail) =>{
            return detail.prodId !== req.params.prodId;
        });

        if(oldProductsLength === order.products.length){
            return res.send({error: "OrderDetail not found!"});
        }

        if(product){
            product.quantity = product.quantity + removedProduct.quantity;
        }
        
        let totalAmount = 0;
        order.products.forEach((product) =>{
            return totalAmount = totalAmount + product.total;
        });
        order.totalAmount = totalAmount; 


        await order.save();
        await product.save();
        res.send(order.products);
    }catch(error){
        res.send({error: "something went wrong!"});
    }
});

module.exports = router;