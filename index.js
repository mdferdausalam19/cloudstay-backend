const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 5000;

// Middleware setup for CORS and JSON parsing
const corsOptions = {
  origin: ["http://localhost:5173", "https://cloudstay-frontend.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};

// MongoDB dependencies and client initialization
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kmxsq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a new MongoDB client with configuration
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Middleware to verify JWT token and extract user data
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    const database = client.db("cloudstay");
    const roomsCollection = database.collection("rooms");
    const usersCollection = database.collection("users");
    const bookingsCollection = database.collection("bookings");

    // Middleware to verify admin
    const verifyAdmin = async (req, res, next) => {
      const email = req?.user?.email;
      const query = { email };
      const result = await usersCollection.findOne(query);
      if (!result || result?.role !== "admin") {
        return res.status(401).send({ message: "unauthorized access" });
      }
      next();
    };

    // Middleware to verify admin
    const verifyHost = async (req, res, next) => {
      const email = req?.user?.email;
      const query = { email };
      const result = await usersCollection.findOne(query);
      if (!result || result?.role !== "host") {
        return res.status(401).send({ message: "unauthorized access" });
      }
      next();
    };

    // Route to generate JWT token and set it as a cookie
    app.post("/jwt", (req, res) => {
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, cookieOptions).send({ success: true });
    });

    // Route to clear JWT token cookie for sign-out
    app.get("/sign-out", (req, res) => {
      try {
        res
          .clearCookie("token", {
            ...cookieOptions,
            maxAge: 0,
          })
          .send({ success: true });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Route to create payment intent
    app.post("/create-payment-intent", verifyToken, async (req, res) => {
      const price = req.body.price;
      const priceInCent = parseFloat(price) * 100;
      if (!price || priceInCent < 1) {
        return;
      }
      // generate client_secret
      const paymentIntent = await stripe.paymentIntents.create({
        amount: priceInCent,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      // send client secret as response
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    // Route to fetch all users
    app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // Route to get user data by email
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // Route to save a user data
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user?.email };
      const isExist = await usersCollection.findOne(query);
      if (isExist) {
        if (user.status === "Requested") {
          // if existing user try to change their role
          const result = await usersCollection.updateOne(query, {
            $set: { status: user?.status },
          });
          return res.send(result);
        } else {
          // if existing user sign in again
          return res.send(isExist);
        }
      }
      //save user for the first time
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });

    // Route to update user data by email
    app.patch("/users/update/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email };
      const updateDoc = {
        $set: {
          ...user,
          timestamp: Date.now(),
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Route to fetch all rooms, optionally filtered by category
    app.get("/rooms", async (req, res) => {
      const category = req.query?.category;
      let query = {};
      if (category && category !== "null") {
        query = { category };
      }
      const result = await roomsCollection.find(query).toArray();
      res.send(result);
    });

    // Route to add a room
    app.post("/rooms", verifyToken, verifyHost, async (req, res) => {
      const roomData = req.body;
      const result = await roomsCollection.insertOne(roomData);
      res.send(result);
    });

    // Route to fetch a specific room by ID
    app.get("/rooms/:id", async (req, res) => {
      const id = req.params?.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.findOne(query);
      res.send(result);
    });

    // Route to fetch all rooms for a specific host based on their email
    app.get(
      "/my-listings/:email",
      verifyToken,
      verifyHost,
      async (req, res) => {
        const email = req.params?.email;
        const query = { "host.email": email };
        const result = await roomsCollection.find(query).toArray();
        res.send(result);
      }
    );

    // Route to delete a specific room by ID
    app.delete("/rooms/:id", verifyToken, verifyHost, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roomsCollection.deleteOne(query);
      res.send(result);
    });

    // Route to add a booking data
    app.post("/bookings", verifyToken, async (req, res) => {
      const bookingData = req.body;
      const result = await bookingsCollection.insertOne(bookingData);
      res.send(result);
    });

    // Route to update the status of the room
    app.patch("/rooms/status/:id", async (req, res) => {
      const id = req.params?.id;
      const status = req.body?.status;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: { booked: status },
      };
      const result = await roomsCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    // Log any errors during connection or runtime
    console.error("Error connecting to MongoDB: ", err.message);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the CloudStay server! 🚀");
});

app.listen(port, () => {
  console.log(`CloudStay server is running on port ${port}`);
});
