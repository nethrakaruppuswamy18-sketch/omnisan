import axios from 'axios';

// Detect if we are running on a static host without a backend
const BACKEND_URL = import.meta.env.VITE_API_URL || '';
const isStaticDeploy = !import.meta.env.DEV && !BACKEND_URL;

class LocalDB {
  private get(key: string) {
    const data = localStorage.getItem(`omni_${key}`);
    return data ? JSON.parse(data) : [];
  }

  private set(key: string, value: any) {
    localStorage.setItem(`omni_${key}`, JSON.stringify(value));
  }

  // Auth
  async register(data: any) {
    const users = this.get('users');
    if (users.find((u: any) => u.email === data.email)) throw new Error('User exists');
    const newUser = { ...data, id: Math.random().toString(36).substr(2, 9), createdAt: new Date().toISOString() };
    delete newUser.password; // Don't store passwords in plain text localStorage for "safety"
    users.push(newUser);
    this.set('users', users);
    return { user: newUser, token: 'local-session-token' };
  }

  async login(data: any) {
    const users = this.get('users');
    const user = users.find((u: any) => u.email === data.email);
    if (!user) throw new Error('Invalid credentials');
    return { user, token: 'local-session-token' };
  }

  // Medications
  async getMedications(userId: string) {
    return this.get('medications').filter((m: any) => m.patientId === userId);
  }

  async addMedication(userId: string, med: any) {
    const meds = this.get('medications');
    const newMed = { ...med, id: Math.random().toString(36).substr(2, 9), patientId: userId, createdAt: new Date().toISOString(), completed: false };
    meds.push(newMed);
    this.set('medications', meds);
    return newMed;
  }

  async updateMedication(userId: string, id: string, data: any) {
    const meds = this.get('medications');
    const idx = meds.findIndex((m: any) => m.id === id && m.patientId === userId);
    if (idx === -1) return null;
    meds[idx] = { ...meds[idx], ...data };
    this.set('medications', meds);
    return meds[idx];
  }

  async deleteMedication(userId: string, id: string) {
    const meds = this.get('medications').filter((m: any) => m.id !== id || m.patientId !== userId);
    this.set('medications', meds);
  }

  // Caretaker
  async getCaretakerPatients(caretakerId: string) {
    const reqs = this.get('requests').filter((r: any) => r.caretakerId === caretakerId && r.status === 'approved');
    const users = this.get('users');
    const meds = this.get('medications');
    return reqs.map((r: any) => {
      const p = users.find((u: any) => u.id === r.patientId);
      return { ...p, medications: meds.filter((m: any) => m.patientId === p.id) };
    });
  }

  async sendRequest(patientId: string, email: string) {
    const caretaker = this.get('users').find((u: any) => u.email === email && u.role === 'caretaker');
    if (!caretaker) throw new Error('Caretaker not found');
    const reqs = this.get('requests');
    const newReq = { id: Math.random().toString(36).substr(2, 9), patientId, caretakerId: caretaker.id, status: 'pending' };
    reqs.push(newReq);
    this.set('requests', reqs);
    return newReq;
  }
  
  async getPendingRequests(caretakerId: string) {
    const reqs = this.get('requests').filter((r: any) => r.caretakerId === caretakerId && r.status === 'pending');
    const users = this.get('users');
    return reqs.map((r: any) => {
      const p = users.find((u: any) => u.id === r.patientId);
      return { ...r, patientName: p.name, patientEmail: p.email };
    });
  }

  async approveRequest(id: string, status: string) {
    const reqs = this.get('requests');
    const idx = reqs.findIndex((r: any) => r.id === id);
    if (idx !== -1) {
      reqs[idx].status = status;
      this.set('requests', reqs);
    }
  }
}

const local = new LocalDB();

export const dataService = {
  async auth(action: 'login' | 'register', payload: any) {
    try {
      const res = await axios.post(`/api/auth/${action}`, payload);
      return res.data;
    } catch (err) {
      console.warn("Backend unavailable, using Local Mode");
      return action === 'login' ? local.login(payload) : local.register(payload);
    }
  },

  async getMe() {
    try {
      const res = await axios.get('/api/auth/me');
      return res.data;
    } catch (err) {
      const token = localStorage.getItem('token');
      if (token === 'local-session-token') {
        const users = JSON.parse(localStorage.getItem('omni_users') || '[]');
        return users[users.length - 1]; // Return last registered for demo check
      }
      throw err;
    }
  },

  async medications(action: 'get' | 'post' | 'put' | 'delete', userId: string, idOrPayload?: any, payload?: any) {
    try {
      if (action === 'get') return (await axios.get('/api/medications')).data;
      if (action === 'post') return (await axios.post('/api/medications', idOrPayload)).data;
      if (action === 'put') return (await axios.put(`/api/medications/${idOrPayload}`, payload)).data;
      if (action === 'delete') return (await axios.delete(`/api/medications/${idOrPayload}`)).data;
    } catch (err) {
      if (action === 'get') return local.getMedications(userId);
      if (action === 'post') return local.addMedication(userId, idOrPayload);
      if (action === 'put') return local.updateMedication(userId, idOrPayload, payload);
      if (action === 'delete') return local.deleteMedication(userId, idOrPayload);
    }
  },

  async caretaker(action: 'getPatients' | 'getPending' | 'request' | 'approve', userId: string, payload?: any) {
    try {
      if (action === 'getPatients') return (await axios.get('/api/caretaker/patients')).data;
      if (action === 'getPending') return (await axios.get('/api/caretaker/pending-requests')).data;
      if (action === 'request') return (await axios.post('/api/caretaker/request', payload)).data;
      if (action === 'approve') return (await axios.put(`/api/caretaker/approve/${payload.id}`, { status: payload.status })).data;
    } catch (err) {
      if (action === 'getPatients') return local.getCaretakerPatients(userId);
      if (action === 'getPending') return local.getPendingRequests(userId);
      if (action === 'request') return local.sendRequest(userId, payload.email);
      if (action === 'approve') return local.approveRequest(payload.id, payload.status);
    }
  }
};
