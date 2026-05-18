import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import fs from "fs";

// Simple persistent store for demo purposes (since we might not have a Mongo instance)
// In a real app, you'd use Mongoose and a Mongo URI.
const DB_FILE = path.join(process.cwd(), "db.json");

interface DBState {
  users: any[];
  medications: any[];
  prescriptions: any[];
  tasks: any[];
  caretakerRequests: any[];
}

function loadDB(): DBState {
  if (fs.existsSync(DB_FILE)) {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  }
  return {
    users: [],
    medications: [],
    prescriptions: [],
    tasks: [],
    caretakerRequests: [],
  };
}

function saveDB(data: DBState) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || "omnisanitas-secret-key-2024";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- MIDDLEWARE ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  const checkRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }
      next();
    };
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    const db = loadDB();

    if (db.users.find((u) => u.email === email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDB(db);

    const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET);
    res.status(201).json({ token, user: { id: newUser.id, name, email, role } });
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const db = loadDB();
    const user = db.users.find((u) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) return res.sendStatus(404);
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // --- MEDICATION ROUTES ---
  app.get("/api/medications", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const meds = db.medications.filter((m) => m.patientId === req.user.id);
    res.json(meds);
  });

  app.post("/api/medications", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const newMed = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      patientId: req.user.id,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    db.medications.push(newMed);
    saveDB(db);
    res.status(201).json(newMed);
  });

  app.put("/api/medications/:id", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const index = db.medications.findIndex((m) => m.id === req.params.id && m.patientId === req.user.id);
    if (index === -1) return res.sendStatus(404);
    db.medications[index] = { ...db.medications[index], ...req.body };
    saveDB(db);
    res.json(db.medications[index]);
  });

  app.delete("/api/medications/:id", authenticateToken, (req: any, res) => {
    const db = loadDB();
    db.medications = db.medications.filter((m) => m.id !== req.params.id || m.patientId !== req.user.id);
    saveDB(db);
    res.sendStatus(204);
  });

  // --- DOCTOR ROUTES ---
  app.get("/api/doctor/patients", authenticateToken, checkRole(["doctor"]), (req: any, res) => {
    const db = loadDB();
    // In a real app, doctors would have assigned patients. Here we show all patients for the demo.
    const patients = db.users.filter((u) => u.role === "patient");
    res.json(patients.map(({ password, ...u }: any) => u));
  });

  app.post("/api/doctor/prescription", authenticateToken, checkRole(["doctor"]), (req: any, res) => {
    const db = loadDB();
    const newPrescription = {
      ...req.body,
      id: Math.random().toString(36).substr(2, 9),
      doctorId: req.user.id,
      createdAt: new Date().toISOString(),
    };
    db.prescriptions.push(newPrescription);
    saveDB(db);
    res.status(201).json(newPrescription);
  });

  // --- CARETAKER ROUTES ---
  app.post("/api/caretaker/request", authenticateToken, checkRole(["patient"]), (req: any, res) => {
    const { email } = req.body;
    const db = loadDB();
    const caretaker = db.users.find((u) => u.email === email && u.role === "caretaker");
    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    const newRequest = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: req.user.id,
      caretakerId: caretaker.id,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    db.caretakerRequests.push(newRequest);
    saveDB(db);
    res.status(201).json(newRequest);
  });

  app.get("/api/caretaker/pending-requests", authenticateToken, checkRole(["caretaker"]), (req: any, res) => {
    const db = loadDB();
    const requests = db.caretakerRequests.filter((r) => r.caretakerId === req.user.id && r.status === "pending");
    // Join with patient data
    const detailedRequests = requests.map((r) => {
      const patient = db.users.find((u) => u.id === r.patientId);
      return { ...r, patientName: patient?.name, patientEmail: patient?.email };
    });
    res.json(detailedRequests);
  });

  app.put("/api/caretaker/approve/:id", authenticateToken, checkRole(["caretaker"]), (req: any, res) => {
    const db = loadDB();
    const index = db.caretakerRequests.findIndex((r) => r.id === req.params.id && r.caretakerId === req.user.id);
    if (index === -1) return res.sendStatus(404);
    db.caretakerRequests[index].status = req.body.status; // 'approved' or 'rejected'
    saveDB(db);
    res.json(db.caretakerRequests[index]);
  });

  app.get("/api/caretaker/patients", authenticateToken, checkRole(["caretaker"]), (req: any, res) => {
    const db = loadDB();
    const connections = db.caretakerRequests.filter((r) => r.caretakerId === req.user.id && r.status === "approved");
    const patients = connections.map((c) => {
      const patient = db.users.find((u) => u.id === c.patientId);
      const meds = db.medications.filter((m) => m.patientId === c.patientId);
      return { ...patient, password: undefined, medications: meds };
    });
    res.json(patients);
  });

  // --- AI ASSISTANT SIMULATION ---
  app.post("/api/ai/chat", (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let response = "I'm not sure about that. Please consult a doctor for professional advice.";

    if (lowerMsg.includes("headache")) {
      response = "For a headache, stay hydrated and rest in a quiet room. If it persists, see a specialist.";
    } else if (lowerMsg.includes("fever")) {
      response = "A fever can indicate an infection. Monitor your temperature and rest. Consult a doctor if it stays high.";
    } else if (lowerMsg.includes("medication") || lowerMsg.includes("pill")) {
      response = "It's important to take your medication exactly as prescribed by your doctor.";
    } else if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
      response = "Hello! I am your OmniSanitas AI assistant. How can I help with your health today?";
    }

    setTimeout(() => {
      res.json({
        response,
        disclaimer: "This assistant is for informational purposes only and not professional medical advice.",
      });
    }, 1000);
  });

  // --- PHARMACY FINDER SIMULATION ---
  app.get("/api/pharmacy/list", (req, res) => {
    const pharmacies = [
      { id: "1", name: "Apollo Pharmacy", address: "123 Health St, Downtown", distance: "0.8 km", phone: "555-0101" },
      { id: "2", name: "MedPlus", address: "456 Wellness Ave, Uptown", distance: "1.5 km", phone: "555-0102" },
      { id: "3", name: "NetMeds Partner Store", address: "789 Care Rd, Mid-City", distance: "2.3 km", phone: "555-0103" },
      { id: "4", name: "Care Pharmacy", address: "101 Pharma Blvd, West-End", distance: "3.1 km", phone: "555-0104" },
    ];
    res.json(pharmacies);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
