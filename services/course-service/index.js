
const express = require("express");
const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3002;

// ─── MongoDB Connection ─────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";
const DB_NAME = process.env.MONGO_DB_NAME || "mtit";

// ─── Course Schema ──────────────────────────────────────────────────────────
const courseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: String,
  name: String,
  credits: Number,
  department: String,
  maxStudents: Number,
});
const Course = mongoose.model("Course", courseSchema);

// ─── Swagger Config ──────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Course Service API",
      version: "1.0.0",
      description: "Microservice for managing university courses",
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
 *     Course:
 *       type: object
 *       required: [id, code, name, credits, department]
 *       properties:
 *         id:
 *           type: string
 *           example: C001
 *         code:
 *           type: string
 *           example: IT4020
 *         name:
 *           type: string
 *           example: Modern Topics in IT
 *         credits:
 *           type: integer
 *           example: 3
 *         department:
 *           type: string
 *           example: IT
 *         maxStudents:
 *           type: integer
 *           example: 50
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: List of all courses
 */
app.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course found
 *       404:
 *         description: Course not found
 */
app.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *       400:
 *         description: Course ID already exists
 */
app.post("/courses", async (req, res) => {
  try {
    const { id, code, name, credits, department, maxStudents } = req.body;
    if (await Course.findOne({ id })) {
      return res.status(400).json({ success: false, message: "Course ID already exists" });
    }
    const newCourse = new Course({ id, code, name, credits, department, maxStudents });
    await newCourse.save();
    res.status(201).json({ success: true, message: "Course created", data: newCourse });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
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
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated
 *       404:
 *         description: Course not found
 */
app.put("/courses/:id", async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Course deleted
 *       404:
 *         description: Course not found
 */
app.delete("/courses/:id", async (req, res) => {
  try {
    const deleted = await Course.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error", error: err.message });
  }
});

app.get("/health", (req, res) => res.json({ service: "course-service", status: "UP", port: PORT }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: DB_NAME });
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`✅ Course Service running at http://localhost:${PORT}`);
      console.log(`📄 Swagger Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

startServer();
