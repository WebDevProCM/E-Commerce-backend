const express = require("express");
const adminAuth = require("../middleware/auth.js");
const apiAuth = require("../middleware/apiAuth.js");
const ordersController = require("../controllers/orders-controller.js");

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

router.post("/api/order", apiAuth, ordersController.create);

//==================api endpoints for getting order and order------------

router.get("/api/orders/admin", adminAuth, ordersController.getAdmin);

router.get("/api/order", apiAuth, ordersController.get);

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
router.patch("/api/order/admin/:id", adminAuth, ordersController.update);

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

router.delete("/api/order/:id", adminAuth, ordersController.remove);

module.exports = router;