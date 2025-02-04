const Order = require("../models/order");
const Product = require("../models/product");
const catchAsyncError = require("../utilis/catchAsyncError");
const AppError = require("../utilis/errorHandler");
const idGenerator = require("../utilis/idGenerator.js");
const Stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const createPayment = catchAsyncError(async (req, res, next) =>{
    const {cartItems} = req.body;
    const productsId = cartItems.map(item => item.prodId)

    const products = await Product.find({prodId: {$in: productsId}});

    if(!products){
        return next(new AppError("no products found!", 404));
    }

    const lineItems = cartItems.map((item) =>{
        const product = products.find(p => p.prodId === item.prodId);

        return{
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.name
                },
                unit_amount: Math.round(product.price * 100)
            },
            quantity: item.quantity
        }
    })


    const session = await Stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems,
        metadata: { userId: req.user._id.toString() },
        success_url: `${process.env.URL}/success`,
        cancel_url: `${process.env.URL}/cancel`
    })

    res.status(201).send({id: session.id})
})

const webhookListener = catchAsyncError(async (req, res, next) =>{
    const sig = req.headers["stripe-signature"];
    const event = Stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(event);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        
        //creating order details to store in the database
        const orderDetails = {};
        orderDetails.ordId = idGenerator.ordIdGenerator();
        orderDetails.customer = session.metadata.userId;
        orderDetails.paid = "yes";
        orderDetails.totalAmount = session.amount_total
        const currentDate = new Date();
        orderDetails.deliveryDate = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Retrieve line items
      const lineItems = await Stripe.checkout.sessions.listLineItems(session.id);

      orderDetails.products = lineItems.data.map(async (product) =>{
          let ordProduct = await Product.findOne({name: product.description});
  
          return {
            totalAmount: product.amount_total,
            name: ordProduct.name,
            image: ordProduct.image,
            price: product.price.unit_amount,
            quantity: product.quantity
           }
      })
    

      // Save order to database
      let order = new Order(orderDetails);

      await order.save();
      res.send("order Saved");
    }
});

module.exports = {
    createPayment,
    webhookListener
}