"use client";

import { FaLink, FaArrowRight, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const ShortLinkLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <FaLink className="text-purple-600" />
            <span>Solusi Link Bio Profesional</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Satu Link,
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Semua Platform
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 mb-10 leading-relaxed">
            Kelola semua link media sosial, website, dan konten digital Anda dalam satu halaman yang menarik dan profesional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6285159793477"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <FaWhatsapp className="text-2xl" />
              <span>Hubungi Kami di WhatsApp</span>
              <FaArrowRight />
            </a>
            
            <a
              href="mailto:info@dipstrategy.co.id"
              className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 hover:border-purple-600 hover:shadow-xl transition-all duration-300"
            >
              <FaEnvelope />
              <span>Email Kami</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortLinkLanding;
