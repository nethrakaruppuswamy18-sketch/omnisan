import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Stethoscope, 
  User, 
  HeartHandshake, 
  ShieldCheck, 
  Clock, 
  Zap,
  ArrowRight,
  Activity
} from 'lucide-react';

const LandingPage = () => {
  const roles = [
    {
      title: 'Doctor',
      icon: Stethoscope,
      description: 'Prescribe medications and monitor your patient health reports efficiently.',
      color: 'bg-blue-500',
      role: 'doctor'
    },
    {
      title: 'Patient',
      icon: User,
      description: 'Track your medication schedule and chat with our AI healthcare assistant.',
      color: 'bg-green-500',
      role: 'patient'
    },
    {
      title: 'Caretaker',
      icon: HeartHandshake,
      description: 'Monitor activities and ensure medication compliance for your loved ones.',
      color: 'bg-purple-500',
      role: 'caretaker'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-medical-blue rounded-xl flex items-center justify-center">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">OMNISANITAS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <a href="#features" className="hover:text-medical-blue transition-colors">Features</a>
          <a href="#about" className="hover:text-medical-blue transition-colors">About</a>
          <Link to="/login" className="medical-btn-primary">Sign In</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="px-4 py-2 bg-medical-light text-medical-blue rounded-full text-sm font-semibold mb-6 inline-block">
            Smart Medication Management
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight">
            Healthcare, Simplified for <br />
            <span className="text-medical-blue">Every Role.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
            OmniSanitas connects doctors, patients, and caretakers in a unified ecosystem 
            designed for better medication adherence and smarter health tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="medical-btn-primary py-4 px-8 text-lg"> Get Started Free </Link>
            <button className="px-8 py-4 bg-slate-100 text-slate-700 rounded-xl font-medium transition-all hover:bg-slate-200">
              View Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Role Selection */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">Choose Your Path</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, idx) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all group"
              >
                <div className={`w-14 h-14 ${role.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <role.icon className={`w-8 h-8 text-slate-800`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{role.title}</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {role.description}
                </p>
                <div className="space-y-3">
                  <Link 
                    to={`/register?role=${role.role}`}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl font-semibold text-slate-700 hover:bg-medical-blue hover:text-white transition-all"
                  >
                    Join as {role.title} <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link 
                    to={`/login?role=${role.role}`}
                    className="w-full block text-center py-2 text-sm text-slate-400 hover:text-medical-blue font-medium"
                  >
                    Already have an account? Sign In
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900 leading-tight">
              Advanced Tools for Modern Healthcare
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex shrink-0 items-center justify-center text-blue-500">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Real-time alerts</h4>
                  <p className="text-slate-600">Never miss a dose with our intelligent notification system synchronized across devices.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex shrink-0 items-center justify-center text-green-500">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Secure & Private</h4>
                  <p className="text-slate-600">Your health data is encrypted and only shared with your approved doctors and caretakers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex shrink-0 items-center justify-center text-purple-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Prescription History</h4>
                  <p className="text-slate-600">Access your entire medical history and prescription records anytime, anywhere.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-medical-light rounded-[3rem] animate-pulse"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=800" 
                alt="Medical Dashboard" 
                className="rounded-3xl shadow-2xl rotate-3 h-4/5 w-4/5 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6 text-medical-blue">
              <Activity className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight text-white">OMNISANITAS</span>
            </div>
            <p className="text-slate-400 max-w-sm">
              Empowering individuals and families to take control of their medication management 
              with smart technology and seamless collaboration.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Contact</h4>
            <ul className="space-y-4 text-slate-400">
              <li>support@omnisanitas.com</li>
              <li>+1 (555) 123-4567</li>
              <li>New York, NY 10001</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 border-t border-slate-800 mt-16 pt-8 text-center text-slate-500 text-sm">
          &copy; 2024 OmniSanitas. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
