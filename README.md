# 🎓 University Management System — Microservices

**IT4020 Modern Topics in IT | Assignment 2 | SLIIT**

---

## 📁 Project Structure

```
university-ms/
├── api-gateway/                  ← API Gateway (Port 3000)
│   ├── index.js
│   └── package.json
└── services/
    ├── student-service/          ← Member 1 | Port 3001
    │   ├── index.js
    │   └── package.json
    ├── course-service/           ← Member 2 | Port 3002
    │   ├── index.js
    │   └── package.json
    ├── lecturer-service/         ← Member 3 | Port 3003
    │   ├── index.js
    │   └── package.json
    └── enrollment-service/       ← Member 4 | Port 3004
        ├── index.js
        └── package.json
```

---

## 🚀 Setup & Run

### Step 1 — Install dependencies (run in each folder)

```bash
# API Gateway
cd api-gateway && npm install

# Services
cd services/student-service    && npm install
cd services/course-service     && npm install
cd services/lecturer-service   && npm install
cd services/enrollment-service && npm install
```

### Step 2 — Start all services (each in a separate terminal)

```bash
# Terminal 1 — Student Service
cd services/student-service && node index.js

# Terminal 2 — Course Service
cd services/course-service && node index.js

# Terminal 3 — Lecturer Service
cd services/lecturer-service && node index.js

# Terminal 4 — Enrollment Service
cd services/enrollment-service && node index.js

# Terminal 5 — API Gateway (start AFTER services are up)
cd api-gateway && node index.js
```

---

## 🌐 Access URLs

### Direct Service Access (Native Swagger)
| Service    | URL                              | Swagger Docs                         |
|------------|----------------------------------|--------------------------------------|
| Student    | http://localhost:3001/students   | http://localhost:3001/api-docs       |
| Course     | http://localhost:3002/courses    | http://localhost:3002/api-docs       |
| Lecturer   | http://localhost:3003/lecturers  | http://localhost:3003/api-docs       |
| Enrollment | http://localhost:3004/enrollments| http://localhost:3004/api-docs       |

### Via API Gateway (Single Port 3000)
| Service    | Gateway URL                              |
|------------|------------------------------------------|
| Students   | http://localhost:3000/api/students       |
| Courses    | http://localhost:3000/api/courses        |
| Lecturers  | http://localhost:3000/api/lecturers      |
| Enrollments| http://localhost:3000/api/enrollments    |
| Unified Docs | http://localhost:3000/api-docs         |

---

## 👥 Team Member Contributions

| Member   | Microservice        | Port |
|----------|---------------------|------|
| Member 1 | Student Service     | 3001 |
| Member 2 | Course Service      | 3002 |
| Member 3 | Lecturer Service    | 3003 |
| Member 4 | Enrollment Service  | 3004 |

---

## 🔌 API Endpoints Summary

### Student Service
- `GET    /students`       — List all students
- `GET    /students/:id`   — Get student by ID
- `POST   /students`       — Create student
- `PUT    /students/:id`   — Update student
- `DELETE /students/:id`   — Delete student

### Course Service
- `GET    /courses`        — List all courses
- `GET    /courses/:id`    — Get course by ID
- `POST   /courses`        — Create course
- `PUT    /courses/:id`    — Update course
- `DELETE /courses/:id`    — Delete course

### Lecturer Service
- `GET    /lecturers`      — List all lecturers
- `GET    /lecturers/:id`  — Get lecturer by ID
- `POST   /lecturers`      — Create lecturer
- `PUT    /lecturers/:id`  — Update lecturer
- `DELETE /lecturers/:id`  — Delete lecturer

### Enrollment Service
- `GET    /enrollments`                    — List all enrollments
- `GET    /enrollments/:id`                — Get enrollment by ID
- `GET    /enrollments/student/:studentId` — Get by student
- `POST   /enrollments`                    — Enroll student
- `PUT    /enrollments/:id`                — Update enrollment/grade
- `DELETE /enrollments/:id`                — Drop enrollment
