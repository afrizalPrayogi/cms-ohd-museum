"use client";

import { FaLink, FaExternalLinkAlt } from "react-icons/fa";
import { FetchData, GetEncrypt } from "app/lib/helper";
import { useState } from "react";

interface ShortLinkSectionProps {
  isAfterBannerPage?: boolean;
  dataApi?: any;
  pageData?: any;
}

const ShortLinkSection = (props: ShortLinkSectionProps) => {
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const sectionLinks = props?.dataApi?.pageShortLinks || [];
  
  const handleLinkClick = async (link: string, linkId: number) => {
    if (trackingId === linkId) return; // Prevent double click on same link
    
    setTrackingId(linkId);
    
    try {
      // Track click - increment count
      await FetchData(
        "api/fe/v1/shortlink/track",
        "POST",
        GetEncrypt(JSON.stringify({ linkId })),
        false,
        "",
        false
      );
    } catch (error) {
      console.error("Error tracking click:", error);
      // Continue to redirect even if tracking fails
    } finally {
      setTrackingId(null);
      // Redirect to link
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 mb-4">
      {sectionLinks.length > 0 ? (
        sectionLinks.map((linkItem: any, index: number) => {
          const hasSecondImage = props?.dataApi?.secondImage;
          
          return (
            <button
              key={linkItem.id || `link-${index}`}
              onClick={() => handleLinkClick(linkItem.link, linkItem.id)}
              disabled={trackingId === linkItem.id}
              className={`group w-full border border-gray-200 hover:border-gray-300 rounded-xl py-4 px-6 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden ${
                hasSecondImage ? '' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              style={hasSecondImage ? {
                backgroundImage: `url(${props?.dataApi?.secondImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              } : undefined}
            >
              {/* Overlay for better text readability when using background image */}
              {hasSecondImage && (
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors -z-0"></div>
              )}
              
              {/* Content wrapper with z-index */}
              <div className="relative z-10 flex items-center gap-4 w-full">
                {/* Image/Icon */}
                {props?.dataApi?.image && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={props?.dataApi?.image} 
                      alt={props?.dataApi?.title || "Link"}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                {/* Title */}
                <span className={`font-semibold text-base text-left flex-1 ${
                  hasSecondImage ? 'text-white drop-shadow-lg' : 'text-gray-900'
                }`}>
                  {trackingId === linkItem.id ? "Loading..." : (props?.dataApi?.title || linkItem.link)}
                </span>
                
                {/* External Link Icon */}
                {trackingId !== linkItem.id && (
                  <FaExternalLinkAlt className={`text-sm transition-colors flex-shrink-0 ${
                    hasSecondImage ? 'text-white group-hover:text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`} />
                )}
              </div>
            </button>
          );
        })
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200">
          <div className="flex flex-col items-center gap-4">
            <FaLink className="text-gray-400 text-4xl" />
            <div className="text-gray-600">
              <h3 className="text-lg font-bold mb-2">No Links Available</h3>
              <p className="text-sm">
                There are no links configured yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortLinkSection;
