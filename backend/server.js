import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import OpenAI from "openai";   // ✅ ADD THIS

import User from "./models/User.js";
import Ticket from "./models/Ticket.js";

dotenv.config();

// ✅ ADD THIS BLOCK HERE
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

console.log("SERVER RUNNING 🚀");

// ✅ CORS (allow all ports)
app.use(cors());

// ✅ JSON parser
app.use(express.json());

// ---------------- DATABASE ----------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Mongo Error ❌", err));

// ---------------- JWT MIDDLEWARE ----------------
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded; // { id, role }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// ---------------- AUTH ----------------

// REGISTER
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  let role = "user";

  // 🔥 AUTO ADMIN (no need to change again)
  if (email === "admin@gmail.com") {
    role = "admin";
  }

  const user = new User({ email, password, role });
  await user.save();

  res.json(user);
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      "secretkey",
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });

  } catch (err) {
    res.status(500).json({ message: "Login error" });
  }
});

// ---------------- TICKETS ----------------

// CREATE
app.post("/api/tickets", verifyToken, async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      userId: req.user.id   // ✅ attach owner
    });

    await ticket.save();
    res.json(ticket);

  } catch (err) {
    res.status(500).json({ message: "Error creating ticket" });
  }
});

// GET
app.get("/api/tickets", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json(await Ticket.find()); // admin → all
    }

    // user → only own
    const tickets = await Ticket.find({ userId: req.user.id });
    res.json(tickets);

  } catch (err) {
    res.status(500).json({ message: "Error fetching tickets" });
  }
});

// UPDATE
app.put("/api/tickets/:id", verifyToken, async (req, res) => {
  try {
    // ❌ block user
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    const updated = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Error updating ticket" });
  }
});
app.delete("/api/tickets/:id", verifyToken, async (req, res) => {
  try {
    // 🔥 only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied ❌" });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ message: "Ticket deleted ✅" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting ticket" });
  }
});
//AI
// app.post("/api/ai-classify", async (req, res) => {
//   try {
//     console.log("AI HIT:", req.body);

//     const { description } = req.body;

//     if (!description) {
//       return res.status(400).json({ message: "No description" });
//     }

//     const response = await openai.responses.create({
//       model: "gpt-4.1-mini",   // ✅ stable model
//       input: `Classify this issue into category and priority.
// Return JSON:
// {"category":"...","priority":"..."}

// Issue: ${description}`
//     });

//     let text = response.output[0].content[0].text;

//     console.log("RAW AI:", text);

//     // clean
//     text = text.replace(/```json|```/g, "").trim();

//     let result;

//     try {
//       result = JSON.parse(text);
//     } catch {
//       result = {
//         category: "General",
//         priority: "Medium"
//       };
//     }

//     res.json(result);

//   } catch (err) {
//     console.error("AI ERROR FULL:", err);
//     res.status(500).json({ message: err.message });
//   }
// });
console.log("OPENAI KEY:", process.env.OPENAI_API_KEY);
// START
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});