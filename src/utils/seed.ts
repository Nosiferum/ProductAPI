import Product from "../models/product";
import connectToMongoDB from "../config/mongoDB";

const seedProducts = [
    {
        name: "Product 1",
        price: 100,
    },
    {
        name: "Product 2",
        price: 200,
    },
    {
        name: "Product 3",
        price: 300,
    },
    {
        name: "Product 4",
        price: 400,
    },
    {
        name: "Product 5",
        price: 500,
    }
]

async function connectAndSeed() {
    await connectToMongoDB();
    for(let i = 0; i < 100; i++) {
        await Product.insertMany(seedProducts)
            .then(result => {
                console.log(result);
            })
            .catch(err => {
                console.log(err)
            })
    }

    process.exit(0);
}

connectAndSeed();




