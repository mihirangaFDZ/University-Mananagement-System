const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3004;

// ─── MongoDB Connection ───────────────────────────────────────────────
const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "mtit";

// ─── Enrollment Schema ────────────────────────────────────────────────
const enrollmentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: String,
  courseId: String,
  enrolledDate: String,
  status: String,
  grade: String,
});
const Enrollment = mongoose.model("Enrollment", enrollmentSchema);

// ─── Swagger Config ──────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Enrollment Service API",
      version: "1.0.0",
      description: "Microservice for managing student course enrollments",
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
 *     Enrollment:
 *       type: object
 *       required: [id, studentId, courseId, enrolledDate, status]
 *       properties:
 *         id:
 *           type: string
 *           example: E001
 *         studentId:
 *           type: string
 *           example: S001
 *         courseId:
 *           type: string
 *           example: C001
 *         enrolledDate:
 *           type: string
 *           format: date
 *           example: 2026-01-10
 *         status:
 *           type: string
 *           enum: [active, completed, dropped]
 *           example: active
 *         grade:
 *           type: string
 *           nullable: true
 *           example: A
 */

/**
 * @swagger
 * /enrollments:
 *   get:
 *     summary: Get all enrollments
 *     tags: [Enrollments]
 *     responses:
 *       200:
 *         description: List of all enrollments
 */
app.get("/enrollments", async (req, res) => {
  try {
    const enrollments = await Enrollment.find();
    res.json({ success: true, count: enrollments.length, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /enrollments/{id}:
 *   get:
 *     summary: Get an enrollment by ID
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment found
 *       404:
 *         description: Enrollment not found
 */
app.get("/enrollments/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ id: req.params.id });
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /enrollments/student/{studentId}:
 *   get:
 *     summary: Get all enrollments for a specific student
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollments found
 */
app.get("/enrollments/student/:studentId", async (req, res) => {
  try {
    const result = await Enrollment.find({ studentId: req.params.studentId });
    res.json({ success: true, count: result.length, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /enrollments:
 *   post:
 *     summary: Enroll a student in a course
 *     tags: [Enrollments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Enrollment'
 *     responses:
 *       201:
 *         description: Enrollment created
 *       400:
 *         description: Enrollment already exists
 */
app.post("/enrollments", async (req, res) => {
  try {
    if (await Enrollment.findOne({ id: req.body.id })) {
      return res.status(400).json({ success: false, message: "Enrollment ID already exists" });
    }

    const newEnrollment = new Enrollment(req.body);
    await newEnrollment.save();
    res.status(201).json({ success: true, message: "Enrollment created", data: newEnrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /enrollments/{id}:
 *   put:
 *     summary: Update enrollment (e.g., update grade or status)
 *     tags: [Enrollments]
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
 *             $ref: '#/components/schemas/Enrollment'
 *     responses:
 *       200:
 *         description: Enrollment updated
 *       404:
 *         description: Enrollment not found
 */
app.put("/enrollments/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, message: "Enrollment updated", data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /enrollments/{id}:
 *   delete:
 *     summary: Drop/delete an enrollment
 *     tags: [Enrollments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment deleted
 *       404:
 *         description: Enrollment not found
 */
app.delete("/enrollments/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndDelete({ id: req.params.id });
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });
    res.json({ success: true, message: "Enrollment deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ service: "enrollment-service", status: "UP", port: PORT }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Enrollment Service running at http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
