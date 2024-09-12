import {Request, Response, Router} from "express";
import Product from "../models/product";
import mongoose from "mongoose";
import wrapAsync from "../utils/wrapAsync";
import {redisClient} from '../config/redisClient';

const router = Router();
const PRODUCT_EXPIRATION = 60;
const PRODUCT_LIST_CACHE_KEY = 'productList';

router.get("/", wrapAsync(async (req: Request, res: Response) => {
    const cachedProducts = await redisClient.get(PRODUCT_LIST_CACHE_KEY);

    if (cachedProducts) {
        res.status(200).json(JSON.parse(cachedProducts));
        return;
    }
    const foundProducts = await Product.find({});

    if (foundProducts.length === 0) {
        res.status(404).json({error: "There is no product to be found"});
        return;
    }
    await redisClient.setEx(PRODUCT_LIST_CACHE_KEY, PRODUCT_EXPIRATION, JSON.stringify(foundProducts));
    res.status(200).json(foundProducts);
}))

router.get("/:id", wrapAsync(async (req: Request, res: Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const cachedProduct = await redisClient.get(`product:${id}`);

    if (cachedProduct) {
        res.status(200).json(JSON.parse(cachedProduct));
        return;
    }
    const foundProduct = await Product.findById(id);

    if (!foundProduct) {
        res.status(404).json({error: "Product not found"});
        return;
    }
    await redisClient.setEx(`product:${id}`, PRODUCT_EXPIRATION, JSON.stringify(foundProduct));
    res.status(200).json(foundProduct);
}))

router.post("/", wrapAsync(async (req: Request, res: Response) => {
    await Product.create(req.body);
    res.status(201).send('Product Added Successfully');
}))

router.put("/:id", wrapAsync(async (req: Request, res: Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    if (!updatedProduct) {
        res.status(404).json({error: "Product not found"});
        return;
    }
    await redisClient.setEx(`product:${id}`, PRODUCT_EXPIRATION, JSON.stringify(updatedProduct));
    res.status(200).json(updatedProduct);
}))

router.delete("/:id", wrapAsync(async (req: Request, res: Response) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({error: "Invalid Product ID"});
        return;
    }
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        res.status(404).json({error: "Product not found with given ID"});
        return;
    }
    await redisClient.del(`product:${id}`);
    res.status(204).send('Product Removed Successfully');
}))

export default router;