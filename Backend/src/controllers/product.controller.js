import productModel from "../models/product.model.js";
import { uploadFile } from "../services/storage.service.js";

export const createProductController = async (req, res) => {
  const { title, description, priceAmount, priceCurrency } = req.body;
  const seller = req.user;

  const images = await Promise.all(
    req.files.map(async (file) => {
      return await uploadFile({
        buffer: file.buffer,
        fileName: file.originalname,
      });
    }),
  );

  const product = await productModel.create({
    title,
    description,
    price: {
      amount: priceAmount,
      currency: priceCurrency || "INR",
    },
    images,
    seller: seller._id,
  });

  res.status(201).json({
    success: true,
    message: "Product created successfully.",
    product,
  });
};


export const getSellerProductsController = async (req, res) => {
    const seller = req.user;

    const products = await productModel.find({seller: seller._id});

    res.status(200).json({
        success: true,
        message: "Products fetched successfully.",
        products
    })
}


export const getAllProductsController = async (req, res) => {
    const products = await productModel.find();

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      products
    })
}