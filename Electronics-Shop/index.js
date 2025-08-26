const express = require("express");
const next = require("next");
const app = next({ dev: true });
const handle = app.getRequestHandler();

const server = express();

server.use(express.json());

const users = require("./models/users");
const products = require("./models/products");
const orders = require("./models/orders");
const coupons = require("./models/coupons");
const printingOrders = require("./models/printingOrders");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "projectImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const multerMiddelware = multer({ storage: storage });

require("./mongodb");

const authenticateToken = (req, res, next) => {
  const token = req.headers["token"];

  if (!token) {
    return res.json({ success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.json({ success: false });
    }
    req.user = user;
    next();
  });
};

app.prepare().then(() => {
  server.post("/register", async (req, res) => {
    let exist = await users.findOne({ username: req.body.username });

    if (exist) {
      res.json({ success: false });
      return;
    }

    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    const data = {
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      phone: req.body.phone,
    };

    await users.insertMany([data]);

    let userID = (await users.findOne({ username: req.body.username })).id;
    const token = jwt.sign({ id: userID }, process.env.JWT_SECRET, {
      expiresIn: "14d",
    });
    res.json({ success: true, token });
  });

  server.post("/login", async (req, res) => {
    let targetUser = await users.findOne({ username: req.body.username });

    if (!targetUser) {
      res.json({ success: false });
      return;
    }

    const checkPass = await bcrypt.compare(
      req.body.password,
      targetUser.password
    );

    if (checkPass) {
      const token = jwt.sign({ id: targetUser._id }, process.env.JWT_SECRET, {
        expiresIn: "14d",
      });
      res.json({ success: true, token });
    } else {
      res.json({ success: false });
    }
  });

  server.post(
    "/api/uploadproduct",
    multerMiddelware.array("photos"),
    async (req, res) => {
      const {
        name,
        categories,
        price,
        discount,
        quantity,
        description,
        specifications,
      } = req.body;

      const uploadPhotos = req.files.map(async (file) => {
        const photo = await cloudinary.uploader.upload(file.path, {
          folder: "products",
        });
        return cloudinary.url(photo.public_id);
      });

      const photos = await Promise.all(uploadPhotos);

      const date = new Date();

      const data = {
        name: name,
        categories: categories,
        price: price,
        discount: discount,
        date: date,
        photo: photos,
        quantity: quantity,
        description: description,
        specifications: specifications,
        popularity: 0,
      };

      await products.insertMany([data]);
    }
  );

  server.get("/api/products", async (req, res) => {
    const product = await products.find();
    return res.json({ products: product });
  });

  server.get("/api/user", authenticateToken, async (req, res) => {
    const user = await users
      .findById(req.user.id)
      .populate("cart.product")
      .exec();
    return res.json({ user: user });
  });

  server.get("/api/orders", async (req, res) => {
    const order = await orders.find();
    return res.json({ orders: order });
  });

  server.get("/api/coupons", async (req, res) => {
    const coupon = await coupons.find();
    return res.json({ coupons: coupon });
  });

  server.get("/api/printingorders", async (req, res) => {
    const order = await printingOrders.find();
    return res.json({ orders: order });
  });

  server.post(
    "/api/cartitem/:id/:quantity/:wishlist",
    authenticateToken,
    async (req, res) => {
      const userID = req.user.id;
      const productID = req.params.id;
      const quantity = req.params.quantity;
      const wishlist = req.params.wishlist;

      const product = await products.findById(productID);

      const exist = await users.findOne({
        _id: userID,
        "cart.productID": productID,
      });

      if (exist) {
        await users.findOneAndUpdate(
          { _id: userID, "cart.productID": productID },
          {
            $inc: {
              "cart.$.quantity": quantity,
              total: quantity * product.price,
            },
          },
          { new: true }
        );
      } else {
        await users.findByIdAndUpdate(userID, {
          $push: {
            cart: {
              product: productID,
              productID: productID,
              quantity: quantity,
            },
          },
          $inc: { total: quantity * product.price },
        });

        await products.findByIdAndUpdate(productID, {
          $inc: { popularity: 1 },
        });
      }

      if (wishlist == "true") {
        await users.findByIdAndUpdate(userID, {
          $pull: { wishlist: productID },
        });
      }

      const newUser = await users
        .findById(userID)
        .populate("cart.product")
        .exec();
      return res.json({ success: true, user: newUser });
    }
  );

  server.delete("/api/cartitem/:id", authenticateToken, async (req, res) => {
    const userID = req.user.id;
    const productID = req.params.id;

    const user = await users.findById(userID).populate("cart.product").exec();

    const cartItem = user.cart.find((item) => item.productID == productID);

    await products.findByIdAndUpdate(productID, { $inc: { popularity: -1 } });

    await users.findByIdAndUpdate(userID, {
      $pull: { cart: { productID: productID } },
      $set: { total: user.total - cartItem.product.price * cartItem.quantity },
    });

    const newUser = await users
      .findById(userID)
      .populate("cart.product")
      .exec();
    return res.json({ success: true, user: newUser });
  });

  server.put(
    "/api/cartitem/:id/:quantity",
    authenticateToken,
    async (req, res) => {
      const userID = req.user.id;
      const productID = req.params.id;
      const quantity = req.params.quantity;

      const user = await users.findById(userID).populate("cart.product").exec();

      const cartItem = user.cart.find((item) => item.productID == productID);

      const def = quantity - cartItem.quantity;

      await users.findOneAndUpdate(
        { _id: userID, "cart.productID": productID },
        {
          $inc: { "cart.$.quantity": def },
          $set: { total: user.total + cartItem.product.price * def },
        }
      );

      const newUser = await users
        .findById(userID)
        .populate("cart.product")
        .exec();
      return res.json({ success: true, user: newUser });
    }
  );

  server.post("/api/order/:id/:coupon", async (req, res) => {
    const { firstName, lastName, address, city, region, notes, shipping } =
      req.body;
    const userID = req.params.id;
    const couponID = req.params.coupon;

    const user = await users.findById(userID).populate("cart.product").exec();

    let productsArr = [];

    for (const item of user.cart) {
      if (item.quantity > item.product.quantity) {
        return res.json({
          success: false,
          error: `Not enough stock for product ${item.product.name}`,
        });
      }
    }

    for (const item of user.cart) {
      productsArr.push(item);
      await products.findByIdAndUpdate(item.productID, {
        $set: {
          popularity: item.product.popularity - 1,
          quantity: item.product.quantity - item.quantity,
        },
      });
    }

    const coupon = couponID != "none" ? await coupons.findById(couponID) : null;

    let total = shipping + user.total - (coupon ? coupon.discount : 0);

    const ordersArr = await orders.find();

    const number = ordersArr.length;

    const order = await orders.insertMany([
      {
        orderID: number + 42100,
        cart: productsArr,
        date: new Date(),
        total: total,
        shipping: shipping ? true : false,
        city: city,
        region: region,
        address: address,
        notes: notes,
      },
    ]);

    const orderID = order[0]._id;

    let userOrders = user.orders;

    userOrders.push(orderID);

    let usedCoupons = user.usedCoupons;

    if (coupon) {
      usedCoupons.push(couponID);
    }

    await users.updateOne(
      { _id: userID },
      {
        $set: {
          cart: [],
          firstname: firstName,
          lastname: lastName,
          address: address,
          city: city,
          region: region,
          orders: userOrders,
          usedCoupons: usedCoupons,
          total: 0,
        },
      }
    );

    const newUser = await users
      .findById(userID)
      .populate("cart.product")
      .exec();

    return res.json({ success: true, user: newUser });
  });

  server.post("/api/addtowishlist/:id", async (req, res) => {
    const userID = req.body._id;
    const productID = req.params.id;

    const user = await users.findById(userID);

    let wishlistArr = user.wishlist;
    const item = wishlistArr.find((el) => el._id == productID);
    if (!item) {
      wishlistArr.push(productID);
    } else {
      wishlistArr = wishlistArr.filter((el) => el._id != productID);
    }
    await users.findByIdAndUpdate(userID, {
      $set: { wishlist: wishlistArr },
    });

    const newUser = await users.findById(userID).populate("cart.product").exec();

    return res.json({ success: true, user: newUser });
  });

  server.post("/api/printingorder/:id", async (req, res) => {
    const userid = req.params.id;
    const orderData = {
      ...req.body,
      orderID: printingOrders.length + 38100,
      date: new Date(),
    };
    const neworder = await printingOrders.insertMany([orderData]);
    const user = await users.findById(userid);
    let ordersarr = user.printingOrders;
    ordersarr.push(neworder[0]._id);
    const updateuser = await users.findByIdAndUpdate(userid, {
      $set: { printingOrders: ordersarr },
    });

    return res.json({ success: true, user: updateuser });
  });

  server.post("/api/coupon", async (req, res) => {
    await coupons.insertMany([req.body]);
  });

  server.post("/api/wishlist", async (req, res) => {
    const userID = req.body._id;
    const user = await users.findById(userID).populate("cart.product").exec();
    const wishlist = user.wishlist;
    let total = user.total;
    const productsToAdd = await products.find({ _id: { $in: wishlist } });
    let finalProducts = [];
    for (const product of productsToAdd) {
      total += product.price;
      const exist = await users.findOneAndUpdate(
        {
          _id: userID,
          "cart.productID": product._id,
        },
        { $inc: { "cart.$.quantity": 1 } });
      if (!exist) {
        finalProducts.push(product);
        await products.findByIdAndUpdate(product._id, {
          $inc: { popularity: 1 }
        });
      }
    }
    const resSet = await users.findByIdAndUpdate(
      userID,
      {
        $set: { wishlist: [], total: total },
        $addToSet: {
          cart: {
            $each: finalProducts.map((p) => ({
              product: p._id,
              productID: p._id,
              quantity: 1,
            })),
          },
        },
      },
      { new: true }
    ).populate("cart.product");
    return res.json({ success: true, user: resSet });
  });

  server.delete("/api/wishlist", async (req, res) => {
    let user = req.body;
    await users.findByIdAndUpdate(user._id, {
      $set: { wishlist: [] },
    });
    return res.json({
      success: true,
    });
  });

  server.post("/api/wishlistsome", async (req, res) => {
    const userID = req.body.user._id,
      selectedItems = req.body.selectedItems;
    const user = await users.findById(userID).populate("cart.product").exec();
    let total = user.total;
    const productsToAdd = selectedItems;
    const newWishlist = user.wishlist.filter((id) => {
      return !productsToAdd.find((product) => product._id == id);
    });
    let finalProducts = [];
    for (const product of productsToAdd) {
      total += product.price;
      const exist = await users.findOneAndUpdate(
        {
          _id: userID,
          "cart.productID": product._id,
        },
        {
          $inc: { "cart.$.quantity": 1 }
        });
      if (!exist) {
        finalProducts.push(product);
        await products.findByIdAndUpdate(product._id, {
          $inc: { popularity: 1 }
        });
      }
    }
    const resSet = await users.findByIdAndUpdate(
      userID,
      {
        $set: { wishlist: newWishlist, total: total },
        $addToSet: {
          cart: {
            $each: finalProducts.map((p) => ({
              product: p._id,
              productID: p._id,
              quantity: 1,
            })),
          },
        },
      },
      { new: true }
    ).populate("cart.product");
    return res.json({ success: true, user: resSet });
  });

  server.delete("/api/wishlistsome", async (req, res) => {
    let { user, selectedItems } = req.body;
    const productsToRemove = selectedItems;
    const newWishlist = user.wishlist.filter((id) => {
      return !productsToRemove.find((product) => product._id == id);
    });
    const userID = await user._id;
    const finalUser = await users.findByIdAndUpdate(
      userID,
      {
        $set: { wishlist: newWishlist },
      },
      { new: true }
    ).populate("cart.product");
    return res.json({
      success: true,
      user: finalUser,
    });
  });

  server.put("/api/edituserdata", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    let user = await users.findById(userId);
    const userData = req.body;

    const checkPass = await bcrypt.compare(userData.curPass, user.password);
    if (!checkPass) {
      return res.json({
        success: false,
        message: "Incorrect current password",
      });
    }

    let hashedPassword = user.password;
    if (userData.newPass) {
      hashedPassword = await bcrypt.hash(userData.newPass, 10);
    }

    const newUser = {
      ...user.toObject(),
      ...userData,
      password: hashedPassword,
    };

    const updatedUser = await users.findByIdAndUpdate(
      userId,
      { $set: { ...newUser } },
      { new: true }
    ).populate("cart.product");

    return res.json({ success: true, user: updatedUser });
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, () => {
    console.log("port running http://localhost:3000");
  });
});
