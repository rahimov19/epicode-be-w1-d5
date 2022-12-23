import express from "express";
import uniqid from "uniqid";
import httpErrors from "http-errors";
import { checkProductsSchema, triggerBadRequest } from "./validator.js";
import { getProducts, writeProducts } from "../../lib/fs-tools.js";

const { NotFound, Unauthorized, BadRequest } = httpErrors;

const productsRouter = express.Router();

productsRouter.post(
  "/",
  checkProductsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    const productsArray = await getProducts();
    try {
      const newProduct = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };

      productsArray.push(newProduct);
      await writeProducts(productsArray);
      res.status(201).send({
        id: newProduct.id,
      });
    } catch (error) {
      next(error);
    }
  }
);

productsRouter.get("/", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    console.log(productsArray);

    if (req.query && req.query.category) {
      const filteredproducts = productsArray.filter(
        (product) => product.category === req.query.category
      );

      res.send(filteredproducts);
    } else {
      res.send(productsArray);
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();
    const product = productsArray.find(
      (product) => product.id === req.params.productId
    );
    if (product) {
      res.send(product);
    } else {
      next(NotFound(`Product with id ${req.params.productId} is not found`));
    }
  } catch (error) {
    next(error);
  }
});

productsRouter.put("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();

    const index = productsArray.findIndex(
      (product) => product.id === req.params.productId
    );
    const oldProduct = productsArray[index];
    const updatedProduct = {
      ...oldProduct,
      ...req.body,
      updatedAt: new Date(),
    };
    productsArray[index] = updatedProduct;
    await writeProducts(productsArray);
    res.send(updatedProduct);
  } catch (error) {
    next(error);
  }
});

productsRouter.delete("/:productId", async (req, res, next) => {
  try {
    const productsArray = await getProducts();

    const remainingproducts = productsArray.filter(
      (product) => product.id !== req.params.productId
    );
    await writeProducts(remainingproducts);
    res.send();
  } catch (error) {
    next(error);
  }
});

export default productsRouter;
