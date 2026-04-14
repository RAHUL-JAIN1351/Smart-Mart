// controllers/productController.js

import Product from '../models/Product.js';

// GET PRODUCTS WITH FILTER, SORT, AND PAGINATION
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    // CATEGORY
    if (category && category !== 'All') filter.category = category;

    // SEARCH (Elastic-like)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // PRICE FILTER
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);

    // STOCK FILTER
    if (inStock === 'true') filter.stock = { $gt: 0 };

    // SORTING
    const sortMap = {
      newest: { createdAt: -1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      rating: { rating: -1 },
      popular: { sold: -1 }
    };
    const sortOption = sortMap[sort] || { createdAt: -1 };

    // PAGINATION
    const skip = (Number(page) - 1) * Number(limit);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    next(err);
  }
};

// GET TRENDING PRODUCTS
export const getTrending = async (req, res, next) => {
  try {
    const products = await Product.find({ isTrending: true })
      .sort({ rating: -1 })
      .limit(8);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET FLASH SALE PRODUCTS
export const getFlashSales = async (req, res, next) => {
  try {
    const products = await Product.find({ isFlashSale: true, stock: { $gt: 0 } })
      .sort({ flashSalePrice: 1 });
    res.json(products);
  } catch (err) {
    next(err);
  }
};

// GET SINGLE PRODUCT BY ID
export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// GET DISTINCT CATEGORIES
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

// ADD REVIEW TO PRODUCT
export const addReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ error: 'Product already reviewed' });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      message: 'Review added',
      rating: product.rating,
      numReviews: product.numReviews
    });

  } catch (err) {
    next(err);
  }
};

// GET PRODUCT RECOMMENDATIONS
export const getRecommendations = async (req, res, next) => {
  try {
    const { category, exclude } = req.query;

    const filter = { _id: { $ne: exclude } };
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .sort({ rating: -1 })
      .limit(4);

    res.json(products);
  } catch (err) {
    next(err);
  }
};

// ADMIN CREATE PRODUCT
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

// ADMIN UPDATE PRODUCT
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product)
      return res.status(404).json({ error: 'Product not found' });

    res.json(product);
  } catch (err) {
    next(err);
  }
};

// ADMIN DELETE PRODUCT
export const deleteProduct = async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};