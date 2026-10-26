"use client";

import { useEffect, useState } from "react";
import { FaShare, FaTimes, FaCopy, FaWhatsapp, FaFacebook, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

interface HeaderShortLinkSectionProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
  pageData?: any;
}

const HeaderShortLinkSection = (props: HeaderShortLinkSectionProps) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const pageTitle = props?.dataApi?.title || "@YourProfile";

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(pageTitle);
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=Check out this link: ${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  };
  
  return (
    <>
      <div className="flex flex-col items-center gap-4 mb-8 relative">
        {/* Share Button - Top Right */}
        <button
          onClick={() => setShowShareModal(true)}
          className="absolute -top-8 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Share"
        >
          <FaShare className="text-gray-700 text-xl" />
        </button>
        
        {/* Logo/Avatar */}
        {props?.dataApi?.image && (
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white">
            <img 
              src={props?.dataApi?.image} 
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-gray-900 text-2xl lg:text-3xl font-bold text-center">
          {props?.dataApi?.title || "@YourProfile"}
        </h1>
        
        {/* Subtitle */}
        {props?.dataApi?.subTitle && (
          <div
            className="text-gray-600 text-sm lg:text-base text-center max-w-md"
            dangerouslySetInnerHTML={{
              __html: props?.dataApi?.subTitle,
            }}
          ></div>
        )}
      </div>
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Share Linktree</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-600 text-xl" />
              </button>
            </div>
            
            {/* Preview Card */}
            <div className="p-6">
              <div className="bg-gradient-to-br from-cyan-400 to-cyan-300 rounded-2xl p-8 mb-6">
                <div className="flex flex-col items-center gap-4">
                  {props?.dataApi?.image && (
                    <div className="w-20 h-20 rounded-full overflow-hidden shadow-xl border-4 border-white bg-white">
                      <img 
                        src={props?.dataApi?.image} 
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {props?.dataApi?.title || "@YourProfile"}
                    </h3>
                  </div>
                </div>
              </div>
              
              {/* Social Share Buttons */}
              <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                    <FaCopy className="text-gray-700 text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors">
                    <FaXTwitter className="text-white text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">X</span>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                    <FaFacebook className="text-white text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors">
                    <FaWhatsapp className="text-white text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors">
                    <FaLinkedin className="text-white text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">LinkedIn</span>
                </button>
                
                <button
                  onClick={() => handleShare('email')}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <span className="text-xs text-gray-600">Email</span>
                </button>
              </div>
              
              {/* Description */}
              <div className="text-center">
                <p className="text-sm text-gray-600 font-semibold mb-2">
                  {props?.dataApi?.title || "Bergabung dengan Linktree"}
                </p>
                <p className="text-xs text-gray-500">
                  Dapatkan Linktree gratis Anda sendiri. Satu-satunya tautan bio yang dipercaya oleh lebih dari 70 juta orang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderShortLinkSection;
