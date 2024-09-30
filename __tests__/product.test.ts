import request from 'supertest';
import Product from '../src/models/product';
import app from '../src/app';
import {redisClient} from '../src/config/redisClient';

describe('Products Endpoint', () => {
    describe('GET /api/products', () => {
        it('should return products from the cache if available', async () => {
            const mockProducts = [
                {name: "Product 1", price: 100},
                {name: "Product 2", price: 200},
                {name: "Product 3", price: 300},
            ];
            (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockProducts));

            const res = await request(app).get('/products').send();

            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                expect.objectContaining({
                    name: 'Product 1',
                    price: 100,
                }),
                expect.objectContaining({
                    name: 'Product 2',
                    price: 200,
                }),
                expect.objectContaining({
                    name: 'Product 3',
                    price: 300,
                })
            ]);
            expect(redisClient.get).toHaveBeenCalledWith('productList');
        });

        it('should return products from the database if not cached', async () => {
            const product = await Product.create({name: 'Test Product', price: 10});
            (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).get('/products').send();

            const cachedProduct = JSON.parse(
                (redisClient.setEx as jest.Mock).mock.calls[0][2]
            );

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0]._id.toString()).toEqual(product._id.toString());
            expect(redisClient.setEx).toHaveBeenCalledWith(
                'productList',
                expect.any(Number),
                expect.any(String)
            );
            expect(cachedProduct).toEqual([
                expect.objectContaining({
                    _id: product._id.toString(),
                    name: 'Test Product',
                    price: 10
                })
            ]);
        });

        it('should return error when product length is zero', async () => {
            const res = await request(app).get('/products').send();

            expect(res.status).toBe(404);
            expect(res.body.length).toBe(undefined);
        });
    });

    describe('POST /products', () => {
        it('should create a new product', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'New Product',
                    price: 20,
                });

            expect(res.status).toBe(201);
            expect(res.text).toBe('Product Added Successfully');

            const products = await Product.find({});
            expect(products.length).toBe(1);
            expect(products[0].name).toBe('New Product');
        });

        it('should give an error when invalid field in body is sent', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'New Product',
                    price: 20,
                    category: "Electronics"
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid fields provided. Only 'name' and 'price' are allowed.");
        });

        it('should give an error when field is not valid', async () => {
            const res = await request(app)
                .post('/products')
                .send({
                    name: 'New Product',
                    price: -1,
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Product validation failed: price: Price must be a positive number");
        });
    });

    describe('GET /products/:id', () => {
       it('should return product with given id from the cache if available', async () => {
           const productId = "66e0248cbf5d9623b8bd2328";
           const mockProduct = {id: productId, name: "Product 1", price: 100};
           (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockProduct));

           const res = await request(app).get(`/products/${productId}`).send();

           expect(res.status).toBe(200);
           expect(res.body).toEqual(
               expect.objectContaining({
                   name: 'Product 1',
                   price: 100,
               })
           );
           expect(redisClient.get).toHaveBeenCalledWith(`product:${productId}`);
       })

        it('should return product with given id from the database if not cached', async () => {
            const product = await Product.create({name: 'Test Product', price: 10});
            (redisClient.get as jest.Mock).mockResolvedValueOnce(null);

            const res = await request(app).get(`/products/${product._id}`).send();

            const cachedProduct = JSON.parse(
                (redisClient.setEx as jest.Mock).mock.calls[0][2]
            );

            expect(res.status).toBe(200);
            expect(redisClient.setEx).toHaveBeenCalledWith(
                `product:${product._id}`,
                expect.any(Number),
                expect.any(String)
            );
            expect(cachedProduct).toEqual(
                expect.objectContaining({
                    _id: product._id.toString(),
                    name: 'Test Product',
                    price: 10
                })
            );
        });

        it('should return error when product id is invalid', async () => {
            const productId = "1";

            const res = await request(app).get(`/products/${productId}`).send();

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid Product ID");
        });

        it('should return error when product is not found with given id', async () => {
            const productId = "66e0248cbf5d9623b8bd2328";

            const res = await request(app).get(`/products/${productId}`).send();

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Product not found");
        });
    });

    describe('PUT /products/:id', () => {
        it('should update an existing product', async () => {
            const product = await Product.create({name: 'Test Product', price: 10});
            (redisClient.get as jest.Mock).mockResolvedValueOnce(JSON.stringify(product));

            const res = await request(app)
                .put(`/products/${product._id}`)
                .send({
                    name: 'Updated Product'
                });

            const cachedProduct = JSON.parse(
                (redisClient.setEx as jest.Mock).mock.calls[0][2]
            );

            expect(res.status).toBe(200);
            expect(res.body.name).toBe('Updated Product');
            expect(redisClient.setEx).toHaveBeenCalledWith(
                `product:${product._id.toString()}`,
                expect.any(Number),
                expect.any(String)
            );

            expect(cachedProduct).toEqual(
                expect.objectContaining({
                    _id: product._id.toString(),
                    name: 'Updated Product',
                    price: 10
                })
            );
        });

        it('should return error when product id is invalid', async () => {
            const productId = "1";

            const res = await request(app)
                .put(`/products/${productId}`)
                .send({
                name: 'Updated Product'
            });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid Product ID");
        });

        it('should return error when product is not found with given id', async () => {
            const productId = "66e0248cbf5d9623b8bd2328";

            const res = await request(app)
                .put(`/products/${productId}`)
                .send({
                    name: 'Updated Product'
                });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Product not found");
        });
    });

    describe('DELETE /products/:id', () => {
        it('should delete a product and remove it from cache', async () => {
            const product = await Product.create({name: 'Test Product', price: 10});

            const res = await request(app).delete(`/products/${product._id}`).send();
            const products = await Product.find({});

            expect(res.status).toBe(204);
            expect(products.length).toBe(0);
            expect(redisClient.del).toHaveBeenCalledWith(`product:${product._id.toString()}`);
        });

        it('should return error when product id is invalid', async () => {
            const productId = "1";

            const res = await request(app).delete(`/products/${productId}`).send();

            expect(res.status).toBe(400);
            expect(res.body.error).toBe("Invalid Product ID");
        });

        it('should return error when product is not found with given id', async () => {
            const productId = "66e0248cbf5d9623b8bd2328";

            const res = await request(app).delete(`/products/${productId}`).send();

            expect(res.status).toBe(404);
            expect(res.body.error).toBe("Product not found with given ID");
        });
    });
});
