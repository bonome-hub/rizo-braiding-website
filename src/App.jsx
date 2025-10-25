import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, Mail, Phone, MapPin, Star, Lock, Trash2, Search, MessageCircle, Award, Heart, Users } from 'lucide-react';

// Mock storage for deployment (replace with real backend later)
const mockStorage = {
  data: {},
  async get(key) {
    return this.data[key] ? { key, value: this.data[key], shared: true } : null;
  },
  async set(key, value) {
    this.data[key] = value;
    return { key, value, shared: true };
  },
  async delete(key) {
    delete this.data[key];
    return { key, deleted: true, shared: true };
  },
  async list(prefix) {
    const keys = Object.keys(this.data).filter(k => k.startsWith(prefix));
    return { keys, prefix, shared: true };
  }
};

// Use window.storage if available, otherwise use mockStorage
const storage = typeof window !== 'undefined' && window.storage ? window.storage : mockStorage;

export default function RizoHairdressing() {
  const [activeSection, setActiveSection] = useState('home');
  const [viewMode, setViewMode] = useState('client');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    name: '',
    phone: '',
    email: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ADMIN_PASSWORD = 'rizo2025';
  const BUSINESS_EMAIL = 'info.rizo.braiding@gmail.com';

  const services = [
    { name: "Knotless Braids", price: "$180", duration: "4-5 hours", description: "Lightweight, natural-looking braids with no tension" },
    { name: "Box Braids", price: "$150", duration: "3-4 hours", description: "Classic protective style with versatile length options" },
    { name: "Cornrows", price: "$80", duration: "2-3 hours", description: "Sleek, close-to-scalp braiding in various patterns" },
    { name: "Feed-In Braids", price: "$120", duration: "3-4 hours", description: "Natural-looking braids that gradually add hair" },
    { name: "Passion Twists", price: "$160", duration: "4-5 hours", description: "Bohemian textured twists for a trendy look" },
    { name: "Faux Locs", price: "$200", duration: "5-6 hours", description: "Dreadlock look without the commitment" }
  ];

  const timeSlots = [
    "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const testimonials = [
    { name: "Jasmine M.", text: "Rizo is absolutely amazing! My knotless braids lasted 8 weeks and looked fresh the whole time.", rating: 5 },
    { name: "Keisha P.", text: "Best braider in the area! She's fast, skilled, and so sweet. Highly recommend!", rating: 5 }
  ];

  useEffect(() => {
    if (isAdminLoggedIn) {
      loadAppointments();
    }
  }, [isAdminLoggedIn]);

  const loadAppointments = async () => {
    try {
      const keys = await storage.list('appointment:');
      if (keys && keys.keys) {
        const allAppointments = [];
        for (const key of keys.keys) {
          try {
            const result = await storage.get(key);
            if (result && result.value) {
              const appointment = JSON.parse(result.value);
              allAppointments.push(appointment);
            }
          } catch (err) {
            console.log('Key not found:', key);
          }
        }
        setAppointments(allAppointments.sort((a, b) => new Date(a.date) - new Date(b.date)));
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    }
  };

  const handleBookingSubmit = async () => {
    console.log('Button clicked!', bookingData);
    
    if (!bookingData.name || !bookingData.phone || !bookingData.email || !bookingData.service || !bookingData.date || !bookingData.time) {
      alert('Please fill in all fields before submitting');
      return;
    }

    const appointment = {
      id: Date.now().toString(),
      ...bookingData,
      createdAt: new Date().toISOString()
    };

    try {
      console.log('Saving appointment...', appointment);
      await storage.set(`appointment:${appointment.id}`, JSON.stringify(appointment));
      console.log('Appointment saved!');
      
      setShowConfirmation(true);
      
      setTimeout(() => {
        setShowConfirmation(false);
        setBookingData({
          service: '',
          date: '',
          time: '',
          name: '',
          phone: '',
          email: ''
        });
      }, 6000);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('There was an error saving your booking. Please try again or contact Rizo directly.');
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setViewMode('admin');
    } else {
      alert('Incorrect password');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminPassword('');
    setViewMode('client');
    setActiveSection('home');
  };

  const deleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await storage.delete(`appointment:${id}`);
        await loadAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.phone.includes(searchTerm) ||
    apt.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === 'admin') {
    if (!isAdminLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <Lock className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-purple-900">Admin Login</h1>
              <p className="text-gray-600 mt-2">Rizo Braiding Services</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handleAdminLogin}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => setViewMode('client')}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Website
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-purple-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-purple-200">Rizo Braiding Services</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => loadAppointments()}
                className="bg-purple-700 px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={handleAdminLogout}
                className="bg-white text-purple-900 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-purple-900">All Appointments</h2>
              <div className="text-lg font-semibold text-gray-700">
                Total: {appointments.length}
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No appointments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((apt) => (
                  <div key={apt.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-purple-900 mb-2">{apt.name}</h3>
                            <div className="space-y-1 text-gray-700">
                              <p className="flex items-center">
                                <Phone className="h-4 w-4 mr-2 text-purple-600" />
                                {apt.phone}
                              </p>
                              <p className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-purple-600" />
                                {apt.email}
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="space-y-2">
                              <p className="text-gray-700">
                                <span className="font-semibold">Service:</span> {apt.service}
                              </p>
                              <p className="flex items-center text-gray-700">
                                <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="font-semibold mr-2">Date:</span> {apt.date}
                              </p>
                              <p className="flex items-center text-gray-700">
                                <Clock className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="font-semibold mr-2">Time:</span> {apt.time}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                          Booked: {new Date(apt.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteAppointment(apt.id)}
                        className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Scissors className="h-8 w-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-900">Rizo Braiding Services</span>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              {['home', 'services', 'gallery', 'booking', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`capitalize ${
                    activeSection === section
                      ? 'text-purple-600 font-semibold'
                      : 'text-gray-700 hover:text-purple-600'
                  } transition-colors`}
                >
                  {section}
                </button>
              ))}
              <button
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold"
                title="Admin Dashboard"
              >
                <Lock className="h-5 w-5" />
                <span>Admin</span>
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-purple-600"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-2">
              {['home', 'services', 'gallery', 'booking', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => {
                    setActiveSection(section);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 capitalize ${
                    activeSection === section
                      ? 'bg-purple-100 text-purple-600 font-semibold'
                      : 'text-gray-700 hover:bg-purple-50'
                  } transition-colors rounded-lg`}
                >
                  {section}
                </button>
              ))}
              <button
                onClick={() => {
                  setViewMode('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                <Lock className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {activeSection === 'home' && (
        <div>
          <section className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-pink-600 text-white py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-6xl font-bold mb-4">Rizo Braiding Services</h1>
              <p className="text-2xl mb-8 text-purple-100">Expert Protective Styles & Natural Hair Care</p>
              <p className="text-lg mb-12 max-w-2xl mx-auto text-purple-50">
                Specializing in knotless braids, box braids, cornrows, and all protective styles. Your hair's health is my priority.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <button
                  onClick={() => setActiveSection('booking')}
                  className="bg-white text-purple-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all shadow-lg"
                >
                  Book Now
                </button>
                <button
                  onClick={() => setActiveSection('gallery')}
                  className="bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-500 transition-all shadow-lg border-2 border-white"
                >
                  View Gallery
                </button>
              </div>
            </div>
          </section>

          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div className="p-6">
                  <Award className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">8+ Years Experience</h3>
                  <p className="text-gray-600">Mastering the art of protective styling</p>
                </div>
                <div className="p-6">
                  <Heart className="h-16 w-16 text-pink-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">Hair Health First</h3>
                  <p className="text-gray-600">Gentle techniques that promote growth</p>
                </div>
                <div className="p-6">
                  <Users className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-purple-900 mb-2">500+ Happy Clients</h3>
                  <p className="text-gray-600">Rated 5 stars by our community</p>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">Client Love</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-purple-900">- {testimonial.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {activeSection === 'services' && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-purple-900 mb-4">My Services</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Professional braiding and protective styling services
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-purple-900 mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-purple-700">{service.price}</span>
                    <span className="text-gray-600 flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'gallery' && (
        <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">My Work</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="aspect-square bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center"
                >
                  <div className="text-center text-white p-6">
                    <Scissors className="h-12 w-12 mx-auto mb-3 opacity-90" />
                    <p className="text-lg font-bold">Style {item}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'booking' && (
        <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-purple-900 mb-4">Book Your Appointment</h2>
            <p className="text-center text-gray-600 mb-12">
              Fill out the form below and Rizo will contact you to confirm
            </p>

            <div className="bg-white rounded-xl shadow-lg p-8">
              {showConfirmation && (
                <div className="mb-6 bg-green-50 border-2 border-green-500 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <Calendar className="h-8 w-8 text-green-600 mr-2" />
                    <h3 className="text-xl font-bold text-green-900">Booking Received!</h3>
                  </div>
                  <p className="text-green-800 mb-2 font-semibold">Thank you {bookingData.name}!</p>
                  <p className="text-green-700 text-sm mb-2">Your appointment request has been submitted successfully.</p>
                  <p className="text-green-700 text-sm">Rizo will contact you at {bookingData.phone} to confirm your appointment.</p>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Your Phone *</label>
                  <input
                    type="tel"
                    value={bookingData.phone}
                    onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                    placeholder="(123) 456-7890"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Your Email *</label>
                  <input
                    type="email"
                    value={bookingData.email}
                    onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Select Service *</label>
                  <select
                    value={bookingData.service}
                    onChange={(e) => setBookingData({...bookingData, service: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a service...</option>
                    {services.map((service, index) => (
                      <option key={index} value={service.name}>
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Preferred Date *</label>
                  <input
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Preferred Time *</label>
                  <select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Choose a time...</option>
                    {timeSlots.map((time, index) => (
                      <option key={index} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 bg-purple-50 rounded-lg p-6">
                <div className="flex items-start">
                  <Calendar className="h-6 w-6 text-purple-600 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-purple-900 mb-2">What happens next?</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      When you click "Submit Booking", your appointment details will be saved securely.
                    </p>
                    <p className="text-gray-700 text-sm">
                      Rizo will review your request in the admin dashboard and contact you to confirm your appointment!
                    </p>
                  </div>
                </div>
              </div>

            <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBookingSubmit();
                }}
                type="button"
                className="w-full mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center cursor-pointer"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Submit Booking
              </button>
            </div>
          </div>
        </section>
      )}

      {activeSection === 'contact' && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center text-purple-900 mb-12">Get In Touch</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-purple-700 mr-4 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Location</p>
                      <p className="text-gray-600">San Diego, California</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-6 w-6 text-purple-700 mr-4 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-gray-600">info.rizo.braiding@gmail.com</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="h-6 w-6 text-purple-700 mr-4 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Hours</p>
                      <p className="text-gray-600">
                        Tue-Fri: 9 AM - 6 PM<br />
                        Saturday: 8 AM - 7 PM<br />
                        Sun-Mon: By Appointment
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-purple-900 mb-6">Quick Message</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    rows={5}
                    placeholder="Your Message"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  ></textarea>
                  <button
                    onClick={() => alert('Thank you for your message! We will get back to you soon.')}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="bg-purple-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">Rizo Braiding Services</span>
          </div>
          <p className="text-purple-200">© 2025 Rizo Braiding Services. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
