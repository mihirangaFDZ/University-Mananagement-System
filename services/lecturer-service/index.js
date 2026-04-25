const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const mongoose = require("mongoose");

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3003;

// ─── MongoDB Connection ────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "mtit";

// ─── Lecturer Schema ─────────────────────────────────────────────────────--
const lecturerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  specialization: String,
  department: String,
});
const Lecturer = mongoose.model("Lecturer", lecturerSchema);

// ─── Swagger Config ──────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Lecturer Service API",
      version: "1.0.0",
      description: "Microservice for managing university lecturers",
    },
    servers: [{ url: `http://localhost:${PORT}`, description: "Direct access" }],
  },
  apis: ["./index.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     Lecturer:
 *       type: object
 *       required: [id, firstName, lastName, email, specialization, department]
 *       properties:
 *         id:
 *           type: string
 *           example: L001
 *         firstName:
 *           type: string
 *           example: Dr. Priya
 *         lastName:
 *           type: string
 *           example: Jayawardena
 *         email:
 *           type: string
 *           example: priya@sliit.lk
 *         specialization:
 *           type: string
 *           example: Software Engineering
 *         department:
 *           type: string
 *           example: IT
 */

/**
 * @swagger
 * /lecturers:
 *   get:
 *     summary: Get all lecturers
 *     tags: [Lecturers]
 *     responses:
 *       200:
 *         description: List of all lecturers
 */
app.get("/lecturers", async (req, res) => {
  try {
    const lecturers = await Lecturer.find();
    res.json({ success: true, count: lecturers.length, data: lecturers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /lecturers/{id}:
 *   get:
 *     summary: Get a lecturer by ID
 *     tags: [Lecturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lecturer found
 *       404:
 *         description: Lecturer not found
 */
app.get("/lecturers/:id", async (req, res) => {
  try {
    const lecturer = await Lecturer.findOne({ id: req.params.id });
    if (!lecturer) return res.status(404).json({ success: false, message: "Lecturer not found" });
    res.json({ success: true, data: lecturer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /lecturers:
 *   post:
 *     summary: Create a new lecturer
 *     tags: [Lecturers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lecturer'
 *     responses:
 *       201:
 *         description: Lecturer created successfully
 *       400:
 *         description: Lecturer ID already exists
 */
app.post("/lecturers", async (req, res) => {
  try {
    const { id, firstName, lastName, email, specialization, department } = req.body;
    if (await Lecturer.findOne({ id })) {
      return res.status(400).json({ success: false, message: "Lecturer ID already exists" });
    }

    const newLecturer = new Lecturer({ id, firstName, lastName, email, specialization, department });
    await newLecturer.save();
    res.status(201).json({ success: true, message: "Lecturer created", data: newLecturer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /lecturers/{id}:
 *   put:
 *     summary: Update a lecturer
 *     tags: [Lecturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Lecturer'
 *     responses:
 *       200:
 *         description: Lecturer updated
 *       404:
 *         description: Lecturer not found
 */
app.put("/lecturers/:id", async (req, res) => {
  try {
    const lecturer = await Lecturer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!lecturer) return res.status(404).json({ success: false, message: "Lecturer not found" });
    res.json({ success: true, message: "Lecturer updated", data: lecturer });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /lecturers/{id}:
 *   delete:
 *     summary: Delete a lecturer
 *     tags: [Lecturers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lecturer deleted
 *       404:
 *         description: Lecturer not found
 */
app.delete("/lecturers/:id", async (req, res) => {
  try {
    const lecturer = await Lecturer.findOneAndDelete({ id: req.params.id });
    if (!lecturer) return res.status(404).json({ success: false, message: "Lecturer not found" });
    res.json({ success: true, message: "Lecturer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ service: "lecturer-service", status: "UP", port: PORT }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Lecturer Service running at http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
