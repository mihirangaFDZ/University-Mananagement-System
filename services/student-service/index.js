const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();
app.use(express.json());

const mongoose = require("mongoose");

// ─── MongoDB Connection ───────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "mtit";

// ─── Student Schema ──────────────────────────────────────────────────
const studentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: String,
  dob: String,
  faculty: String,
});
const Student = mongoose.model("Student", studentSchema);

// ─── Swagger Config ──────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 3001;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Student Service API",
      version: "1.0.0",
      description: "Microservice for managing university students",
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
 *     Student:
 *       type: object
 *       required: [id, firstName, lastName, email, faculty]
 *       properties:
 *         id:
 *           type: string
 *           example: S001
 *         firstName:
 *           type: string
 *           example: Kamal
 *         lastName:
 *           type: string
 *           example: Perera
 *         email:
 *           type: string
 *           example: kamal@uni.lk
 *         dob:
 *           type: string
 *           format: date
 *           example: 2002-04-15
 *         faculty:
 *           type: string
 *           example: Computing
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     responses:
 *       200:
 *         description: List of all students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 */
app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student found
 *       404:
 *         description: Student not found
 */
app.get("/students/:id", async (req, res) => {
  try {
    const student = await Student.findOne({ id: req.params.id });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *       400:
 *         description: Student ID already exists
 */
app.post("/students", async (req, res) => {
  try {
    const { id, firstName, lastName, email, dob, faculty } = req.body;
    if (await Student.findOne({ id })) {
      return res.status(400).json({ success: false, message: "Student ID already exists" });
    }

    const newStudent = new Student({ id, firstName, lastName, email, dob, faculty });
    await newStudent.save();
    res.status(201).json({ success: true, message: "Student created", data: newStudent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update a student
 *     tags: [Students]
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
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated
 *       404:
 *         description: Student not found
 */
app.put("/students/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student updated", data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete a student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student deleted
 *       404:
 *         description: Student not found
 */
app.delete("/students/:id", async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ id: req.params.id });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ service: "student-service", status: "UP", port: PORT }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");
    const server = app.listen(PORT, () => {
      console.log(`✅ Student Service running at http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Stop the existing process or run with a different PORT.`);
      } else {
        console.error("❌ Server startup error:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
