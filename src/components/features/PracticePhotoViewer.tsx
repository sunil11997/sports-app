"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GeoPhoto } from '@/lib/photo-storage';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Eye, 
  EyeOff, 
  MapPin, 
  Calendar, 
  Clock, 
  Trophy, 
  Sparkles,
  Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PracticePhotoViewerProps {
  photos: GeoPhoto[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export function PracticePhotoViewer({
  photos,
  initialIndex = 0,
  open,
  onClose
}: PracticePhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync index on open or prop change
  useEffect(() => {
    if (open) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, photos.length - 1)));
      setZoom(1);
      setPan({ x: 0, y: 0 });
    }
  }, [open, initialIndex, photos.length]);

  // Reset zoom & pan when switching photo
  const handleSelectPhoto = useCallback((index: number) => {
    setCurrentIndex(index);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleNext = useCallback(() => {
    if (photos.length <= 1) return;
    handleSelectPhoto((currentIndex + 1) % photos.length);
  }, [currentIndex, photos.length, handleSelectPhoto]);

  const handlePrev = useCallback(() => {
    if (photos.length <= 1) return;
    handleSelectPhoto((currentIndex - 1 + photos.length) % photos.length);
  }, [currentIndex, photos.length, handleSelectPhoto]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(4, Number((prev + 0.5).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(2)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleZoom = () => {
    if (zoom > 1) {
      handleResetZoom();
    } else {
      setZoom(2.2);
    }
  };

  // Keyboard navigation & zoom shortcuts
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowInfo(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, handleNext, handlePrev]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom(prev => Math.min(4, Number((prev + 0.25).toFixed(2))));
    } else {
      setZoom(prev => {
        const next = Math.max(1, Number((prev - 0.25).toFixed(2)));
        if (next === 1) setPan({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch dragging for mobile / tablets
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoom > 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current && e.touches.length === 1 && zoom > 1) {
      setPan({
        x: e.touches[0].clientX - touchStartRef.current.x,
        y: e.touches[0].clientY - touchStartRef.current.y
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Download photo
  const handleDownload = () => {
    const photo = photos[currentIndex];
    if (!photo?.url) return;
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `waghamba-practice-${photo.sport || 'activity'}-${photo.date || 'today'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!open || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between select-none animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* TOP BAR / CONTROLS */}
      <div className="w-full bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3 min-w-0">
          <Badge className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 tracking-wider uppercase">
            {currentPhoto.sport || 'Sports Practice'}
          </Badge>
          <div className="min-w-0 hidden sm:block">
            <h2 className="text-white font-black text-sm tracking-tight truncate">
              {currentPhoto.caption || "सराव प्रत्यक्ष पाहणी (Practice Verification)"}
            </h2>
            <p className="text-[11px] font-bold text-slate-400 truncate">
              {currentPhoto.drill ? `प्रकार: ${currentPhoto.drill} • ` : ''} {currentPhoto.date} {currentPhoto.timestamp ? `(${currentPhoto.timestamp})` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="h-8 w-8 text-slate-200 hover:text-white hover:bg-slate-700 rounded-lg"
              title="झूम कमी करा (Zoom Out -)"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs font-black text-amber-400 hover:text-amber-300 font-mono tracking-wider"
              title="मूळ आकार (Reset 1x)"
            >
              {Math.round(zoom * 100)}%
            </button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="h-8 w-8 text-slate-200 hover:text-white hover:bg-slate-700 rounded-lg"
              title="झूम वाढवा (Zoom In +)"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            
            {zoom > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleResetZoom}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg ml-0.5"
                title="Reset (0)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Toggle Metadata Info */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(prev => !prev)}
            className={`h-9 w-9 rounded-xl border border-slate-700 ${showInfo ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'} hover:text-white`}
            title={showInfo ? "माहिती लपवा (Hide Details)" : "माहिती दाखवा (Show Details)"}
          >
            {showInfo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>

          {/* Download Photo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700"
            title="फोटो डाऊनलोड करा (Download High-Res Photo)"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Toggle Fullscreen */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-9 w-9 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 hidden sm:flex"
            title="पूर्ण स्क्रीन (Toggle Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>

          {/* Close Lightbox */}
          <Button
            type="button"
            onClick={onClose}
            className="h-9 px-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1"
            title="बंद करा (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">बंद करा</span>
          </Button>
        </div>
      </div>

      {/* MAIN VIEWPORT (INTERACTIVE IMAGE DISPLAY) */}
      <div 
        className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-black/80"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700 shadow-2xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              title="मागील फोटो (Previous ◀)"
            >
              <ChevronLeft className="w-6 h-6 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full border border-slate-700 shadow-2xl backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
              title="पुढील फोटो (Next ▶)"
            >
              <ChevronRight className="w-6 h-6 text-amber-400" />
            </button>
          </>
        )}

        {/* Main Expandable & Zoomable Image */}
        <div 
          className={`relative max-w-full max-h-full transition-transform ${isDragging ? 'duration-0' : 'duration-150 ease-out'}`}
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
          }}
          onDoubleClick={handleToggleZoom}
        >
          <img
            ref={imageRef}
            src={currentPhoto.url}
            alt={currentPhoto.caption || "Practice Photo"}
            className="max-h-[75vh] max-w-[92vw] md:max-w-[85vw] object-contain rounded-2xl shadow-2xl pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Quick Helper Badge Overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>विद्यार्थी स्पष्ट पाहण्यासाठी डबल क्लिक करा किंवा स्क्रोल करून झूम करा</span>
          </div>
        </div>

        {/* Multi-Photo Counter Pill */}
        {photos.length > 1 && (
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 text-amber-400 font-mono text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
              {currentIndex + 1} / {photos.length}
            </div>
          </div>
        )}

        {/* METADATA INFO FLOATING CARD */}
        {showInfo && (
          <div className="absolute bottom-20 sm:bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-20 bg-slate-900/90 backdrop-blur-md border-2 border-amber-400/30 rounded-2xl p-4 text-white shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <span className="font-bold text-white text-xs truncate">
                {currentPhoto.caption || `${currentPhoto.sport || "Sports"} Practice`}
              </span>
              {currentPhoto.lat != null && currentPhoto.lng != null ? (
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] shrink-0 font-mono">
                  GPS Verified
                </Badge>
              ) : (
                <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] shrink-0 font-mono">
                  Location Unavailable
                </Badge>
              )}
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-medium">
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">{currentPhoto.locationName || "Location not recorded"}</span>
              </div>
              
              <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-300 bg-slate-950/60 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <span className={currentPhoto.lat != null ? "text-amber-400" : "text-slate-500"}>
                  {currentPhoto.lat != null && currentPhoto.lng != null
                    ? `🌐 Lat ${currentPhoto.lat}°, Lng ${currentPhoto.lng}°`
                    : `🌐 GPS: Unavailable`}
                </span>
                <span className="text-slate-400">🕒 {currentPhoto.timestamp || currentPhoto.date}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM THUMBNAIL STRIP & CONTROLS */}
      <div className="w-full bg-slate-900/95 border-t border-slate-800/80 px-4 py-2.5 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
          {/* Zoom Preset Chips */}
          <div className="hidden md:flex items-center gap-1.5">
            {[1, 1.5, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => {
                  setZoom(level);
                  if (level === 1) setPan({ x: 0, y: 0 });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  zoom === level 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {level}x
              </button>
            ))}
          </div>

          {/* Thumbnail Gallery for Quick Navigation */}
          {photos.length > 1 ? (
            <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 scrollbar-thin">
              {photos.map((p, idx) => (
                <button
                  key={p.id || idx}
                  type="button"
                  onClick={() => handleSelectPhoto(idx)}
                  className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                    idx === currentIndex
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                      : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={p.url}
                    alt={`Thumb ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === currentIndex && (
                    <div className="absolute inset-0 bg-amber-400/20" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>सराव करणारा खेळाडू बारकाईने पाहण्यासाठी फोटो ड्रॅग / झूम करा</span>
            </div>
          )}

          {/* Quick Close / Done Button */}
          <Button
            type="button"
            onClick={onClose}
            className="h-8 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase px-4 rounded-xl border border-slate-700"
          >
            झाले (Done)
          </Button>
        </div>
      </div>
    </div>
  );
}
