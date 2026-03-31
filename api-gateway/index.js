const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(express.json());

// ─── Service Registry ─────────────────────────────────────────────────────────
const SERVICES = {
  student:    { url: "http://localhost:3001", prefix: "/api/students",    path: "/students" },
  course:     { url: "http://localhost:3002", prefix: "/api/courses",     path: "/courses" },
  lecturer:   { url: "http://localhost:3003", prefix: "/api/lecturers",   path: "/lecturers" },
  enrollment: { url: "http://localhost:3004", prefix: "/api/enrollments", path: "/enrollments" },
};

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Proxy Routes ─────────────────────────────────────────────────────────────
Object.entries(SERVICES).forEach(([name, service]) => {
  app.use(
    service.prefix,
    createProxyMiddleware({
      target: service.url,
      changeOrigin: true,
      pathRewrite: { [`^${service.prefix}`]: service.path },
      on: {
        error: (err, req, res) => {
          console.error(`[Gateway] Error routing to ${name}-service:`, err.message);
          res.status(503).json({ success: false, message: `${name} service unavailable` });
        },
      },
    })
  );
});

// ─── Aggregated Swagger Docs ──────────────────────────────────────────────────
const aggregatedSpec = {
  openapi: "3.0.0",
  info: {
    title: "University Management System — API Gateway",
    version: "1.0.0",
    description:
      "Centralized API Gateway providing unified access to all University microservices on a single port (3000). " +
      "Routes requests to Student (3001), Course (3002), Lecturer (3003), and Enrollment (3004) services.",
  },
  servers: [{ url: "http://localhost:3000", description: "API Gateway (single port)" }],
  tags: [
    { name: "Students",    description: "Student management endpoints (→ port 3001)" },
    { name: "Courses",     description: "Course management endpoints (→ port 3002)" },
    { name: "Lecturers",   description: "Lecturer management endpoints (→ port 3003)" },
    { name: "Enrollments", description: "Enrollment management endpoints (→ port 3004)" },
  ],
  paths: {
    // ── Students ──────────────────────────────────────────────────────────────
    "/api/students": {
      get:  { tags: ["Students"], summary: "Get all students",    responses: { 200: { description: "List of students" } } },
      post: { tags: ["Students"], summary: "Create a student",    requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } } }, responses: { 201: { description: "Student created" } } },
    },
    "/api/students/{id}": {
      get:    { tags: ["Students"], summary: "Get student by ID",    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Student found" }, 404: { description: "Not found" } } },
      put:    { tags: ["Students"], summary: "Update student",       parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Student" } } } }, responses: { 200: { description: "Student updated" } } },
      delete: { tags: ["Students"], summary: "Delete student",       parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Student deleted" } } },
    },
    // ── Courses ───────────────────────────────────────────────────────────────
    "/api/courses": {
      get:  { tags: ["Courses"], summary: "Get all courses",  responses: { 200: { description: "List of courses" } } },
      post: { tags: ["Courses"], summary: "Create a course",  requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Course" } } } }, responses: { 201: { description: "Course created" } } },
    },
    "/api/courses/{id}": {
      get:    { tags: ["Courses"], summary: "Get course by ID", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Course found" }, 404: { description: "Not found" } } },
      put:    { tags: ["Courses"], summary: "Update course",    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Course" } } } }, responses: { 200: { description: "Course updated" } } },
      delete: { tags: ["Courses"], summary: "Delete course",    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Course deleted" } } },
    },
    // ── Lecturers ─────────────────────────────────────────────────────────────
    "/api/lecturers": {
      get:  { tags: ["Lecturers"], summary: "Get all lecturers",  responses: { 200: { description: "List of lecturers" } } },
      post: { tags: ["Lecturers"], summary: "Create a lecturer",  requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Lecturer" } } } }, responses: { 201: { description: "Lecturer created" } } },
    },
    "/api/lecturers/{id}": {
      get:    { tags: ["Lecturers"], summary: "Get lecturer by ID", parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Lecturer found" }, 404: { description: "Not found" } } },
      put:    { tags: ["Lecturers"], summary: "Update lecturer",    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Lecturer" } } } }, responses: { 200: { description: "Lecturer updated" } } },
      delete: { tags: ["Lecturers"], summary: "Delete lecturer",    parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Lecturer deleted" } } },
    },
    // ── Enrollments ───────────────────────────────────────────────────────────
    "/api/enrollments": {
      get:  { tags: ["Enrollments"], summary: "Get all enrollments",  responses: { 200: { description: "List of enrollments" } } },
      post: { tags: ["Enrollments"], summary: "Enroll a student",     requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Enrollment" } } } }, responses: { 201: { description: "Enrollment created" } } },
    },
    "/api/enrollments/{id}": {
      get:    { tags: ["Enrollments"], summary: "Get enrollment by ID",  parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Enrollment found" } } },
      put:    { tags: ["Enrollments"], summary: "Update enrollment",      parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Enrollment" } } } }, responses: { 200: { description: "Enrollment updated" } } },
      delete: { tags: ["Enrollments"], summary: "Drop enrollment",        parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }], responses: { 200: { description: "Enrollment deleted" } } },
    },
    "/api/enrollments/student/{studentId}": {
      get: { tags: ["Enrollments"], summary: "Get enrollments by student ID", parameters: [{ in: "path", name: "studentId", required: true, schema: { type: "string" } }], responses: { 200: { description: "Enrollments found" } } },
    },
  },
  components: {
    schemas: {
      Student:    { type: "object", properties: { id: { type: "string", example: "S001" }, firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string" }, dob: { type: "string" }, faculty: { type: "string" } } },
      Course:     { type: "object", properties: { id: { type: "string", example: "C001" }, code: { type: "string" }, name: { type: "string" }, credits: { type: "integer" }, department: { type: "string" }, maxStudents: { type: "integer" } } },
      Lecturer:   { type: "object", properties: { id: { type: "string", example: "L001" }, firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string" }, specialization: { type: "string" }, department: { type: "string" } } },
      Enrollment: { type: "object", properties: { id: { type: "string", example: "E001" }, studentId: { type: "string" }, courseId: { type: "string" }, enrolledDate: { type: "string" }, status: { type: "string", enum: ["active", "completed", "dropped"] }, grade: { type: "string", nullable: true } } },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(aggregatedSpec));

// ─── Gateway Health & Info ────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "UP",
    port: 3000,
    routes: Object.entries(SERVICES).map(([name, s]) => ({
      service: name,
      gatewayPath: s.prefix,
      targetUrl: s.url + s.path,
    })),
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "🎓 University Management System — API Gateway",
    docs: "http://localhost:3000/api-docs",
    services: {
      students:    "http://localhost:3000/api/students",
      courses:     "http://localhost:3000/api/courses",
      lecturers:   "http://localhost:3000/api/lecturers",
      enrollments: "http://localhost:3000/api/enrollments",
    },
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🌐 API Gateway running at http://localhost:${PORT}`);
  console.log(`📄 Unified Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`\nRoutes:`);
  Object.entries(SERVICES).forEach(([name, s]) => {
    console.log(`  ${s.prefix}  →  ${s.url}${s.path}`);
  });
});
