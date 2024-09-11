import express from "express";
import Product from "../models/product";
import mongoose from "mongoose";
import wrapAsync from "../utils/wrapAsync";

const router = express.Router();

router.get("/", wrapAsync(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const foundProducts = await Product.find({});

    if (!foundProducts) {
        res.status(404).json({error: "There is no product to be found"});
        return;
    }
    res.status(200).json(foundProducts);
}))

router.get("/:id", wrapAsync(async (req: express.Request, res: express.Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const foundProduct = await Product.findById(id);

    if (!foundProduct) {
        res.status(404).json({error: "Product not found"});
        return;
    }
    res.status(200).json(foundProduct);
}))

router.post("/", wrapAsync(async (req: express.Request, res: express.Response) => {
    await Product.create(req.body);
    res.status(201).send('Product Added Successfully');
}))

router.put("/:id", wrapAsync(async (req: express.Request, res: express.Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const foundProduct = await Product.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    if (!foundProduct) {
        res.status(404).json({error: "Product not found"});
        return;
    }
    res.status(200).json(foundProduct);
}))

router.delete("/:id", wrapAsync(async (req: express.Request, res: express.Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        res.status(404).json({error: "Product not found with given ID"});
    }
    res.status(204).send('Product Removed Successfully');
}))

export default router;