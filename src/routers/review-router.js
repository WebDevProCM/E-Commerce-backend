const express = require("express");
const apiAuth = require("../middleware/apiAuth.js");
const adminAuth = require("../middleware/auth.js");
const reviewsController = require("../controllers/reviews-controller.js")

const router = new express.Router();

router.post("/api/review", apiAuth, reviewsController.create);

router.get("/api/review", reviewsController.get);

// router.get("/api/review/:id", async (req, res) =>{
//     try{
//         const review = await Review.findById(req.params.id);
//         await review.populate("product", {name: 1, prodId: 1, _id: 1, category: 1});
//         await review.populate("user", {name: 1, email: 1, address: 1});

//         if(!review){
//             return res.send({error: "Reviewed item not found!"});
//         }
//         res.send(review);
//     }catch(error){
//         res.send({error: "Something went wrong!"});
//     }
// });

router.patch("/api/review/:id", adminAuth, reviewsController.update);

router.delete("/api/review/:id", adminAuth, reviewsController.remove);

module.exports = router;