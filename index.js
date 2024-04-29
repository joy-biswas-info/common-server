const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const port = 5050;

const dbUrl =
  "mongodb+srv://pEbwFUdZ4EB22rvn:rjQrQYRUq6iYLiEd@ecommerce.8waunlt.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce";
const client = new MongoClient(dbUrl, {
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("ecommerce_db");
    const productCollection = db.collection("products");
    const cartCollection = db.collection("cart");

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: true, data: product });
    });

    app.post("/product", async (req, res) => {
      const product = req.body;

      const result = await productCollection.insertOne(product);

      res.send(result);
    });

    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productCollection.deleteOne({
        _id: id,
      });
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find({});
      const result = await cursor.toArray();
      res.status(200).json(result);
    });
    app.post("/cart", async (req, res) => {
      const cart = req.body;
      const productId = req.body._id;
      const exist = await cartCollection.findOne({ _id: productId });
      if (!exist) {
        const result = await cartCollection.insertOne(cart);
        res.status(200).json(result);
      } else {
        const result = await cartCollection.findOneAndUpdate(
          { _id: productId },
          { $inc: { quantity: 1 } },
          { returnDocument: "after" }
        );
        if (!result) {
          console.error("Product not found ");
          res.json({ error: "Product not found " });
          return;
        }
        res.status(200).json(result);
      }
    });

    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const result = await cartCollection.deleteOne({
        _id: id,
      });
      res.send(result);
    });

    app.patch("/cart/reduce/:id", async (req, res) => {
      const id = req.params.id;
      const result = await cartCollection.findOneAndUpdate(
        { _id: id },
        { $inc: { quantity: -1 } },
        { returnDocument: "after" },
        { new: true }
      );
      if (result.quantity < 1) {
        cartCollection.deleteOne({ _id: id });
      }
      res.send(result);
    });

    app.post("/comment/:id", async (req, res) => {
      const productId = req.params.id;
      const comment = req.body.comment;

      console.log(productId);
      console.log(comment);

      const result = await productCollection.updateOne(
        { _id: new ObjectId(productId) },
        { $push: { comments: comment } }
      );

      if (result.modifiedCount !== 1) {
        console.error("Product not found or comment not added");
        res.json({ error: "Product not found or comment not added" });
        return;
      }

      console.log("Comment added successfully");
      res.json({ message: "Comment added successfully" });
    });

    app.get("/comment/:id", async (req, res) => {
      const productId = req.params.id;

      const result = await productCollection.findOne(
        { _id: new ObjectId(productId) },
        { projection: { _id: 0, comments: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Common server is listening on port ${port}`);
});
