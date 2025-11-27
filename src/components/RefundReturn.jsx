import React from "react";
import Header from "./Header";
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiDollarSign,
} from "react-icons/fi";

const RefundReturn = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Refund & Return Policy</h1>
          <p className="text-xl text-green-100 max-w-3xl mx-auto">
            Your satisfaction is our priority. Learn about our hassle-free
            return and refund process designed to protect your investment in
            quality agricultural products.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Overview */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Policy Overview
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              At KrusheeMart, we understand that sometimes products may not meet
              your expectations or requirements. Our comprehensive return and
              refund policy ensures that you can shop with confidence, knowing
              that we stand behind the quality of our products and services.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiClock className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  7-Day Return Window
                </h3>
                <p className="text-gray-600 text-sm">
                  Easy returns within 7 days of delivery
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiRefreshCw className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Quick Processing
                </h3>
                <p className="text-gray-600 text-sm">
                  Returns processed within 3-5 business days
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiDollarSign className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Full Refunds
                </h3>
                <p className="text-gray-600 text-sm">
                  100% refund for eligible returns
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Return Eligibility */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Return Eligibility
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
                Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Products damaged during transit or delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Wrong products delivered (different from order)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Manufacturing defects or quality issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Expired products (if delivered expired)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Incomplete orders or missing items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Unopened packages in original condition</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FiAlertCircle className="w-6 h-6 text-red-600" />
                Not Eligible for Return
              </h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Products used or applied in the field</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Opened pesticide or chemical containers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Custom or specially ordered items</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Products returned after 7 days of delivery</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Items without original packaging or labels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Products damaged due to misuse or negligence</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Return Process */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            How to Return Products
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Contact Support
              </h3>
              <p className="text-gray-600 text-sm">
                Call us at +91 98765 43210 or email support@krusheemart.com
                within 7 days of delivery
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Get Authorization
              </h3>
              <p className="text-gray-600 text-sm">
                Receive a Return Authorization Number (RAN) and return
                instructions from our team
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Package & Ship
              </h3>
              <p className="text-gray-600 text-sm">
                Pack items securely in original packaging and ship using
                provided return label
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Get Refund
              </h3>
              <p className="text-gray-600 text-sm">
                Receive full refund within 3-5 business days after we receive
                and inspect the return
              </p>
            </div>
          </div>
        </section>

        {/* Refund Information */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Refund Information
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Processing Time
                  </h4>
                  <p className="text-gray-600">
                    Refunds are processed within 3-5 business days after we
                    receive and inspect the returned product. The refund will be
                    credited to your original payment method.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Refund Amount
                  </h4>
                  <p className="text-gray-600">
                    You will receive a 100% refund of the product price for
                    eligible returns. Shipping charges are refundable only if
                    the return is due to our error.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Payment Methods
                  </h4>
                  <p className="text-gray-600">
                    Refunds are issued to the original payment method used for
                    purchase. For cash on delivery orders, refunds are processed
                    via bank transfer.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Exchange Policy
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Product Exchange
                  </h4>
                  <p className="text-gray-600">
                    We offer product exchanges for damaged or wrong items
                    delivered. Exchanges are subject to product availability and
                    must be initiated within 7 days.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Size/Variant Exchange
                  </h4>
                  <p className="text-gray-600">
                    For products with different sizes or variants, exchanges are
                    possible if the item is unused and in original packaging.
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Processing Time
                  </h4>
                  <p className="text-gray-600">
                    Exchange requests are processed within 2-3 business days.
                    New products are shipped once we receive the returned item.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Cases */}
        <section className="mb-16">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8">
              Special Cases & Exceptions
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiPackage className="w-5 h-5 text-blue-600" />
                  Bulk Orders
                </h3>
                <p className="text-gray-600 mb-4">
                  For bulk orders (quantity &gt; 100 units), special return
                  policies may apply. Please contact our sales team for specific
                  terms and conditions.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                  Hazardous Materials
                </h3>
                <p className="text-gray-600">
                  Certain pesticides and chemicals have strict return guidelines
                  due to safety regulations. These products can only be returned
                  if unopened and within original packaging.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiClock className="w-5 h-5 text-green-600" />
                  Seasonal Products
                </h3>
                <p className="text-gray-600 mb-4">
                  Seeds and seasonal products may have different return windows
                  based on planting seasons. Check product-specific return
                  policies before purchase.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FiDollarSign className="w-5 h-5 text-purple-600" />
                  Promotional Items
                </h3>
                <p className="text-gray-600">
                  Products purchased during special promotions or discounts
                  follow the same return policy but refunds will be processed
                  based on the discounted price paid.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact for Returns */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Need Help with Returns?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our customer support team is here to make your return process as
            smooth as possible. Contact us through any of the following
            channels.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+919876543210"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <FiPackage className="w-4 h-4" />
              Call for Return Support
            </a>
            <a
              href="mailto:support@krusheemart.com"
              className="border border-green-600 text-green-600 px-8 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium inline-flex items-center justify-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Email Return Request
            </a>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mt-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FiAlertCircle className="w-5 h-5 text-yellow-600" />
              Important Notes
            </h3>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>
                • This return policy is applicable only for products purchased
                directly from KrusheeMart
              </li>
              <li>
                • Return shipping costs are borne by KrusheeMart for eligible
                returns due to our error
              </li>
              <li>
                • Customers are responsible for return shipping costs for change
                of mind returns
              </li>
              <li>
                • All returns must include the Return Authorization Number (RAN)
                to be processed
              </li>
              <li>
                • KrusheeMart reserves the right to refuse returns that don't
                meet our policy guidelines
              </li>
              <li>
                • This policy may be updated periodically. Please check our
                website for the latest version
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default RefundReturn;
