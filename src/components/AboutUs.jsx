import React from "react";
import Header from "./Header";
import { FiUsers, FiTruck, FiShield, FiAward, FiHeart, FiMapPin } from "react-icons/fi";

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About KrusheeMart</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Empowering farmers with quality agricultural products and innovative solutions 
            for sustainable farming practices across the nation.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Company Overview */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Founded with a vision to revolutionize agriculture in India, KrusheeMart has been 
                at the forefront of providing farmers with high-quality agricultural products, 
                equipment, and expertise since our inception.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                We understand the challenges faced by modern farmers and are committed to bridging 
                the gap between traditional farming practices and cutting-edge agricultural technology. 
                Our comprehensive platform offers everything from premium pesticides and fertilizers 
                to state-of-the-art farming equipment.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, KrusheeMart serves thousands of farmers across multiple states, helping them 
                achieve better yields, reduce costs, and adopt sustainable farming practices that 
                benefit both their livelihoods and the environment.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">10,000+</div>
                  <div className="text-gray-600">Happy Farmers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                  <div className="text-gray-600">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
                  <div className="text-gray-600">Districts Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">5+</div>
                  <div className="text-gray-600">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Foundation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower farmers with access to quality agricultural products and knowledge, 
                enabling sustainable farming practices that improve livelihoods and food security.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To be India's leading agricultural marketplace, driving innovation in farming 
                while promoting environmental sustainability and rural prosperity.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Our Values</h3>
              <p className="text-gray-600">
                Quality, integrity, innovation, and farmer-centricity guide everything we do. 
                We believe in building trust through transparent practices and reliable service.
              </p>
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Pesticides</h3>
              <p className="text-gray-600 text-sm">
                Effective crop protection solutions from trusted brands for healthy harvests.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Fertilizers</h3>
              <p className="text-gray-600 text-sm">
                Nutrient-rich fertilizers to boost soil health and maximize crop yields.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🚜</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Farm Equipment</h3>
              <p className="text-gray-600 text-sm">
                Modern farming tools and machinery to improve efficiency and productivity.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🌾</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Seeds & More</h3>
              <p className="text-gray-600 text-sm">
                High-quality seeds and other agricultural inputs for successful farming.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose KrusheeMart?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiShield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  All products are sourced from certified manufacturers and undergo rigorous quality checks.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiTruck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">
                  Quick and reliable delivery network ensuring products reach farmers on time.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiUsers className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Expert Support</h3>
                <p className="text-gray-600">
                  Dedicated agricultural experts provide guidance and support for farming decisions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiMapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Wide Coverage</h3>
                <p className="text-gray-600">
                  Serving farmers across multiple states with localized product recommendations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiAward className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Competitive Pricing</h3>
                <p className="text-gray-600">
                  Fair and transparent pricing with regular offers and bulk purchase discounts.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiHeart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Farmer First</h3>
                <p className="text-gray-600">
                  Every decision we make prioritizes the success and welfare of our farming community.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-white rounded-xl shadow-sm p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready to Transform Your Farming?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers who trust KrusheeMart for their agricultural needs. 
            Start your journey towards better yields and sustainable farming practices today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/user"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Explore Products
            </a>
            <a
              href="/contact"
              className="border border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;