import express from "express";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import mongoose from "mongoose";

// --- PERSISTENCE LAYER ---
const MONGODB_URI = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === "production";

// Use Mongoose if URI is provided, else fallback to JSON file
const useMongo = !!MONGODB_URI;

// Define Schemas for Mongo
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["doctor", "patient", "caretaker"], required: true },
  createdAt: { type: Date, default: Date.now },
});

const MedicationSchema = new mongoose.Schema({
  patientId: String,
  medicationName: String,
  dosage: String,
  frequency: String,
  timing: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const CaretakerRequestSchema = new mongoose.Schema({
  patientId: String,
  caretakerId: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const PresciptionSchema = new mongoose.Schema({
  doctorId: String,
  patientId: String,
  medications: Array,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const UserModel = useMongo ? mongoose.model("User", UserSchema) : null;
const MedicationModel = useMongo ? mongoose.model("Medication", MedicationSchema) : null;
const CaretakerRequestModel = useMongo ? mongoose.model("CaretakerRequest", CaretakerRequestSchema) : null;
const PrescriptionModel = useMongo ? mongoose.model("Prescription", PresciptionSchema) : null;

// JSON Fallback logic
const DB_FILE = path.join(process.cwd(), "db.json");
function loadDB() {
  if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  return { users: [], medications: [], prescriptions: [], caretakerRequests: [] };
}
function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const JWT_SECRET = process.env.JWT_SECRET || "omnisanitas-secret-key-2024";

async function startServer() {
  if (useMongo) {
    try {
      await mongoose.connect(MONGODB_URI!);
      console.log("Connected to MongoDB Atlas");
    } catch (err) {
      console.error("MongoDB connection error:", err);
    }
  }

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Configure CORS to allow the frontend (Vercel or local)
  app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean) as string[],
    credentials: true
  }));
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

  const checkRole = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };

  // --- AUTH ROUTES ---
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, role } = req.body;
    
    if (useMongo && UserModel) {
      const existing = await UserModel.findOne({ email });
      if (existing) return res.status(400).json({ message: "User already exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserModel.create({ name, email, password: hashedPassword, role });
      const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET);
      return res.status(201).json({ token, user: { id: user.id, name, email, role } });
    } else {
      const db = loadDB();
      if (db.users.find((u:any) => u.email === email)) return res.status(400).json({ message: "User exists" });
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: Math.random().toString(36).substr(2, 9), name, email, password: hashedPassword, role, createdAt: new Date().toISOString() };
      db.users.push(newUser);
      saveDB(db);
      const token = jwt.sign({ id: newUser.id, role: newUser.role, name: newUser.name }, JWT_SECRET);
      res.status(201).json({ token, user: { id: newUser.id, name, email, role } });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    let user: any;

    if (useMongo && UserModel) {
      user = await UserModel.findOne({ email });
    } else {
      user = loadDB().users.find((u: any) => u.email === email);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id || user._id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user.id || user._id, name: user.name, email: user.email, role: user.role } });
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    let user: any;
    if (useMongo && UserModel) {
      user = await UserModel.findById(req.user.id);
    } else {
      user = loadDB().users.find((u: any) => u.id === req.user.id);
    }
    if (!user) return res.sendStatus(404);
    const { password: _, ...cleanUser } = (user.toObject ? user.toObject() : user);
    res.json(cleanUser);
  });

  // --- MEDICATION ROUTES ---
  app.get("/api/medications", authenticateToken, async (req: any, res) => {
    if (useMongo && MedicationModel) {
      const meds = await MedicationModel.find({ patientId: req.user.id });
      res.json(meds);
    } else {
      const meds = loadDB().medications.filter((m: any) => m.patientId === req.user.id);
      res.json(meds);
    }
  });

  app.post("/api/medications", authenticateToken, async (req: any, res) => {
    if (useMongo && MedicationModel) {
      const med = await MedicationModel.create({ ...req.body, patientId: req.user.id });
      res.status(201).json(med);
    } else {
      const db = loadDB();
      const newMed = { ...req.body, id: Math.random().toString(36).substr(2, 9), patientId: req.user.id, completed: false, createdAt: new Date().toISOString() };
      db.medications.push(newMed);
      saveDB(db);
      res.status(201).json(newMed);
    }
  });

  app.put("/api/medications/:id", authenticateToken, async (req: any, res) => {
    if (useMongo && MedicationModel) {
      const med = await MedicationModel.findOneAndUpdate({ _id: req.params.id, patientId: req.user.id }, req.body, { new: true });
      res.json(med);
    } else {
      const db = loadDB();
      const index = db.medications.findIndex((m:any) => m.id === req.params.id && m.patientId === req.user.id);
      if (index === -1) return res.sendStatus(404);
      db.medications[index] = { ...db.medications[index], ...req.body };
      saveDB(db);
      res.json(db.medications[index]);
    }
  });

  app.delete("/api/medications/:id", authenticateToken, async (req: any, res: any) => {
    if (useMongo && MedicationModel) {
      await MedicationModel.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
      res.sendStatus(204);
    } else {
      const db = loadDB();
      db.medications = db.medications.filter((m: any) => m.id !== req.params.id || m.patientId !== req.user.id);
      saveDB(db);
      res.sendStatus(204);
    }
  });

  // --- DOCTOR & CARETAKER ROUTES (Simplified mappings) ---
  app.get("/api/doctor/patients", authenticateToken, checkRole(["doctor"]), async (req: any, res) => {
    if (useMongo && UserModel) {
      const patients = await UserModel.find({ role: "patient" }).select("-password");
      res.json(patients);
    } else {
      const patients = loadDB().users.filter((u:any) => u.role === "patient").map(({password, ...u}:any) => u);
      res.json(patients);
    }
  });

  app.post("/api/caretaker/request", authenticateToken, checkRole(["patient"]), async (req: any, res) => {
    const { email } = req.body;
    let caretaker: any;
    if (useMongo && UserModel) {
      caretaker = await UserModel.findOne({ email, role: "caretaker" });
    } else {
      caretaker = loadDB().users.find((u:any) => u.email === email && u.role === "caretaker");
    }

    if (!caretaker) return res.status(404).json({ message: "Caretaker not found" });

    if (useMongo && CaretakerRequestModel) {
      const r = await CaretakerRequestModel.create({ patientId: req.user.id, caretakerId: caretaker.id || caretaker._id });
      res.status(201).json(r);
    } else {
      const db = loadDB();
      const r = { id: Math.random().toString(36).substr(2, 9), patientId: req.user.id, caretakerId: caretaker.id, status: "pending", createdAt: new Date().toISOString() };
      db.caretakerRequests.push(r);
      saveDB(db);
      res.status(201).json(r);
    }
  });

  app.get("/api/caretaker/pending-requests", authenticateToken, checkRole(["caretaker"]), async (req: any, res) => {
    if (useMongo && CaretakerRequestModel && UserModel) {
      const requests = await CaretakerRequestModel.find({ caretakerId: req.user.id, status: "pending" });
      const detailed = await Promise.all(requests.map(async (r:any) => {
        const p = await UserModel.findById(r.patientId);
        return { ...r.toObject(), patientName: p?.name, patientEmail: p?.email };
      }));
      res.json(detailed);
    } else {
      const db = loadDB();
      const detailed = db.caretakerRequests.filter((r:any) => r.caretakerId === req.user.id && r.status === "pending").map((r:any) => {
        const p = db.users.find((u:any) => u.id === r.patientId);
        return { ...r, patientName: p?.name, patientEmail: p?.email };
      });
      res.json(detailed);
    }
  });

  app.put("/api/caretaker/approve/:id", authenticateToken, checkRole(["caretaker"]), async (req: any, res) => {
    if (useMongo && CaretakerRequestModel) {
      const r = await CaretakerRequestModel.findOneAndUpdate({ _id: req.params.id, caretakerId: req.user.id }, { status: req.body.status }, { new: true });
      res.json(r);
    } else {
      const db = loadDB();
      const index = db.caretakerRequests.findIndex((r:any) => r.id === req.params.id && r.caretakerId === req.user.id);
      if (index === -1) return res.sendStatus(404);
      db.caretakerRequests[index].status = req.body.status;
      saveDB(db);
      res.json(db.caretakerRequests[index]);
    }
  });

  app.get("/api/caretaker/patients", authenticateToken, checkRole(["caretaker"]), async (req: any, res) => {
    if (useMongo && CaretakerRequestModel && UserModel && MedicationModel) {
      const conns = await CaretakerRequestModel.find({ caretakerId: req.user.id, status: "approved" });
      const patients = await Promise.all(conns.map(async (c:any) => {
        const p = await UserModel.findById(c.patientId).select("-password").lean();
        const meds = await MedicationModel.find({ patientId: c.patientId }).lean();
        return { ...p, id: p._id, medications: meds };
      }));
      res.json(patients);
    } else {
      const db = loadDB();
      const patients = db.caretakerRequests.filter((r:any) => r.caretakerId === req.user.id && r.status === "approved").map((c:any) => {
        const patient = db.users.find((u:any) => u.id === c.patientId);
        const meds = db.medications.filter((m:any) => m.patientId === c.patientId);
        return { ...patient, password: undefined, medications: meds };
      });
      res.json(patients);
    }
  });

  // --- AI & PHARMACY (Stateless) ---
  app.post("/api/ai/chat", (req, res) => {
    const { message } = req.body;
    const lowerMsg = message.toLowerCase();
    let response = "I'm not sure about that. Please consult a doctor for professional advice.";
    if (lowerMsg.includes("headache")) response = "For a headache, stay hydrated and rest.";
    else if (lowerMsg.includes("fever")) response = "Consult a doctor if your fever remains high.";
    else if (lowerMsg.includes("hi") || lowerMsg.includes("hello")) response = "Hello! How can I help you today?";
    
    setTimeout(() => res.json({ response, disclaimer: "Not professional medical advice." }), 800);
  });

  app.get("/api/pharmacy/list", (req, res) => {
    res.json([
      { id: "1", name: "Apollo Pharmacy", address: "123 Health St", distance: "0.8 km", phone: "555-0101" },
      { id: "2", name: "MedPlus", address: "456 Wellness Ave", distance: "1.5 km", phone: "555-0102" }
    ]);
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
