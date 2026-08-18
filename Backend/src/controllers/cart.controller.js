import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import paymentModel from "../models/payment.model.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { createOrder } from "../services/payment.service.js";
import mongoose from "mongoose";
import { getCartDetails } from "../dao/cart.dao.js";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils.js";
import { config } from "../config/config.js";

export const addToCartController = async (req, res) => {
  const { productId, variantId } = req.params;
  const { quantity = 1 } = req.body;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product or variant not Found",
    });
  }

  const stock = await stockOfVariant(productId, variantId);

  const cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  const isProductAlreadyInCart = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId,
  );

  if (isProductAlreadyInCart) {
    const quantityInCart = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    );

    if (quantityInCart + quantity > stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${stock - quantityInCart} items left in stock and you already have ${quantityInCart} items in your cart.`,
      });
    }

    await cartModel.findOneAndUpdate(
      {
        user: req.user._id,
        "items.product": productId,
        "items.variant": variantId,
      },
      { $inc: { "items.$.quantity": quantity } },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Cart updated successfully.",
    });
  }

  if (quantity > stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${stock} items left in stock`,
    });
  }

  cart.items.push({
    product: productId,
    variant: variantId,
    quantity,
    price: {
      amount: product.price.amount,
      currency: product.price.currency,
    },
  });

  await cart.save();

  return res.status(200).json({
    success: true,
    message: "Product added to cart successfully.",
  });
};

export const getCartController = async (req, res) => {
  const user = req.user;

  let cart = await getCartDetails(user._id);

  if (!cart) {
    cart = await cartModel.create({ user: user._id });
  }

  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully.",
    cart,
  });
};

export const incrementCartItemQuantityController = async (req, res) => {
  const { productId, variantId } = req.params;

  const product = await productModel.findOne({
    _id: productId,
    "variants._id": variantId,
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product or variant not found",
    });
  }

  const cart = await cartModel.findOne({ user: req.user._id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const stock = await stockOfVariant(productId, variantId);

  const itemQuantityInCart =
    cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.variant?.toString() === variantId,
    )?.quantity || 0;

  if (itemQuantityInCart + 1 > stock) {
    return res.status(400).json({
      success: false,
      message: `Only ${stock} items left in stock, and you have already ${itemQuantityInCart} items in your cart.`,
    });
  }

  await cartModel.findOneAndUpdate(
    {
      user: req.user._id,
      "items.product": productId,
      "items.variant": variantId,
    },
    { $inc: { "items.$.quantity": 1 } },
    { new: true },
  );

  return res.status(200).json({
    success: true,
    message: "Cart item quantity incremented successfully.",
  });
};

export const decrementCartItemQuantityController = async (req, res) => {
  const { productId, variantId } = req.params;

  const cart = await cartModel.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const item = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId,
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Product variant not found in cart",
    });
  }

  // If quantity is 1, remove the item
  if (item.quantity === 1) {
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.product.toString() === productId &&
          item.variant?.toString() === variantId
        ),
    );

    await cart.save();

    return res.status(200).json({
      success: true,
      removed: true,
      message: "Product removed from cart.",
    });
  }

  // Otherwise decrease quantity
  item.quantity -= 1;

  await cart.save();

  return res.status(200).json({
    success: true,
    removed: false,
    message: "Cart item quantity decremented successfully.",
  });
};

export const removeCartItemController = async (req, res) => {
  const { productId, variantId } = req.params;

  const cart = await cartModel.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemExists = cart.items.some(
    (item) =>
      item.product.toString() === productId &&
      item.variant?.toString() === variantId,
  );

  if (!itemExists) {
    return res.status(404).json({
      success: false,
      message: "Product variant not found in cart",
    });
  }

  // Remove the item
  cart.items = cart.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        item.variant?.toString() === variantId
      ),
  );

  // If no items are left, delete the entire cart
  if (cart.items.length === 0) {
    await cartModel.deleteOne({
      _id: cart._id,
    });

    return res.status(200).json({
      success: true,
      cartDeleted: true,
      message: "Product removed and cart deleted successfully.",
    });
  }

  // Otherwise save the updated cart
  await cart.save();

  return res.status(200).json({
    success: true,
    cartDeleted: false,
    message: "Product removed from cart successfully.",
  });
};

export const createOrderController = async (req, res) => {
  const cart = await getCartDetails(req.user._id);

  if (!cart) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  const order = await createOrder({
    amount: cart.totalPrice,
    currency: cart.currency,
  });

  const payment = await paymentModel.create({
    user: req.user._id,
    razorpay: {
      orderId: order.id,
    },
    price: {
      amount: cart.totalPrice,
      currency: cart.currency,
    },
    orderItems: cart.items.map((item) => ({
      title: item.product.title,
      productId: item.product._id,
      variantId: item.varinat,
      quantity: item.quantity,
      images: item.product.variants.images || item.product.images,
      description: item.product.description,
      price: {
        amount: item.product.variants.price.amount || item.product.price.amount,
        currency:
          item.product.variants.price.currency || item.product.price.currency,
      },
    })),
  });

  return res.status(200).json({
    success: true,
    message: "Order created successfully.",
    order,
  });
};

export const verifyOrderController = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;


  const payment = await paymentModel.findOne({
    "razorpay.orderId": razorpay_order_id,
    status: "pending"
  })

  if(!payment) {
        return res.status(400).json({
            success: false,
            message: "Payment not found"
        })
  }

  const isPaymentValid = validatePaymentVerification({
    order_id: razorpay_order_id,
    payment_id: razorpay_payment_id
    
  }, razorpay_signature, config.RAZORPAY_KEY_SECRET)

  if(!isPaymentValid) {
        payment.status == "failed"
        await payment.save();

        return res.status(400).json({
            success: false,
            message: "Payment verification failed"
        })
  }

  payment.status == "paid";

  payment.razorpay.paymentId = razorpay_payment_id
  payment.razorpay.signature = razorpay_signature

  await payment.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully."
  })

};
