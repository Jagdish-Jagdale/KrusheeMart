import React, { useState } from "react";
import Header from "./Header";
import { FiPhone, FiMail, FiMapPin, FiClock, FiMessageSquare, FiSend } from "react-icons/fi";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Have questions or need support? We're here to help you succeed in your farming journey.
            Get in touch with our expert team today.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Get in Touch</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Phone Support</h3>
                  <p className="text-gray-600 mb-2">Speak directly with our agricultural experts</p>
                  <p className="text-green-600 font-semibold">+91 98765 43210</p>
                  <p className="text-green-600 font-semibold">+91 87654 32109</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Email Support</h3>
                  <p className="text-gray-600 mb-2">Send us your questions anytime</p>
                  <p className="text-blue-600 font-semibold">info@krusheemart.com</p>
                  <p className="text-blue-600 font-semibold">support@krusheemart.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Head Office</h3>
                  <p className="text-gray-600 mb-2">Visit us at our main location</p>
                  <p className="text-gray-700">
                    KrusheeMart Agricultural Solutions<br />
                    Plot No. 123, Green Valley Industrial Area<br />
                    Sector 18, Gurugram, Haryana 122015<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Business Hours</h3>
                  <p className="text-gray-600 mb-2">We're available to help when you need us</p>
                  <p className="text-gray-700">
                    Monday - Friday: 9:00 AM - 7:00 PM<br />
                    Saturday: 9:00 AM - 5:00 PM<br />
                    Sunday: 10:00 AM - 4:00 PM<br />
                    <span className="text-green-600 font-semibold">Emergency Support: 24/7</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Support Options */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Support</h3>
              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 px-4 rounded-lg hover:bg-green-100 transition-colors">
                  <FiPhone className="w-4 h-4" />
                  Call Now
                </button>
                <button className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-3 px-4 rounded-lg hover:bg-blue-100 transition-colors">
                  <FiMessageSquare className="w-4 h-4" />
                  Live Chat
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h2>
            
            {submitStatus === "success" && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
                <strong>Thank you!</strong> Your message has been sent successfully. We'll get back to you within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="product-inquiry">Product Inquiry</option>
                  <option value="order-support">Order Support</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="complaint">Complaint</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400"
                  placeholder="Please provide details about your inquiry..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Regional Offices */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Regional Offices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">North India</h3>
              <p className="text-gray-600 mb-2">📍 New Delhi Office</p>
              <p className="text-gray-600">📞 +91 11-4567-8901</p>
              <p className="text-gray-600">✉️ north@krusheemart.com</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">West India</h3>
              <p className="text-gray-600 mb-2">📍 Mumbai Office</p>
              <p className="text-gray-600">📞 +91 22-6789-0123</p>
              <p className="text-gray-600">✉️ west@krusheemart.com</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">South India</h3>
              <p className="text-gray-600 mb-2">📍 Bangalore Office</p>
              <p className="text-gray-600">📞 +91 80-8901-2345</p>
              <p className="text-gray-600">✉️ south@krusheemart.com</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mt-16 bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How can I place an order?</h3>
              <p className="text-gray-600 mb-4">
                You can place orders through our website, mobile app, or by calling our customer support team. 
                Create an account, browse products, add to cart, and checkout securely.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What are your delivery areas?</h3>
              <p className="text-gray-600 mb-4">
                We currently deliver to over 50 districts across North, West, and South India. 
                Enter your pincode during checkout to check delivery availability.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Do you provide technical support?</h3>
              <p className="text-gray-600 mb-4">
                Yes! Our agricultural experts provide free consultation on product selection, 
                usage guidelines, and farming best practices. Contact us anytime for support.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 mb-4">
                We accept all major payment methods including credit/debit cards, UPI, 
                net banking, and cash on delivery (where available).
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactUs;