import express from "express";
import Product from "../models/product";

const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
const foundProduct : typeof Product[] = await Product.find({});
res.json(foundProduct);

})

router.get("/:id", async (req: express.Request, res: express.Response) => {
    const {id} = req.params;
    const foundProduct = await Product.findById(id);
    //todo add logic when not found
    //todo add logic when id is not appropriate
    res.json(foundProduct);
})

export default router;