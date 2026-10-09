import React, { useState, useRef, DragEvent } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Link as LinkIcon,
  Grid,
  Check,
  AlertTriangle,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { ProductImage } from '../ProductImage';
import {
  DEFAULT_PRODUCT_IMAGE,
  PRESET_PRODUCT_IMAGES,
  optimizeAndConvertImage,
  validateImageFile,
  OptimizedImageResult,
  isValidProductImageUrl,
} from '../../services/imageStorage';

interface ProductImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

type TabType = 'upload' | 'preset' | 'url';

export const ProductImageUpload: React.FC<ProductImageUploadProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<OptimizedImageResult | null>(null);
  const [customUrl, setCustomUrl] = useState(
    value && !value.startsWith('data:') && !value.startsWith('/src/assets/') ? value : ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDataUrl = Boolean(value && value.startsWith('data:image/'));
  const isPreset = PRESET_PRODUCT_IMAGES.some((p) => p.url === value);
  const isExternalUrl = Boolean(
    value && (value.startsWith('http://') || value.startsWith('https://'))
  );

  const handleFileProcess = async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'ফাইলের যাচাইকরণ ব্যর্থ হয়েছে।');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await optimizeAndConvertImage(file, 900, 0.85);
      setUploadedInfo(result);
      onChange(result.dataUrl);
    } catch (err: any) {
      setError(err?.message || 'ছবি আপলোড ও প্রসেস করতে ত্রুটি হয়েছে।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
    // reset input so the same file can be re-selected if needed
    e.target.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedInfo(null);
    setError(null);
    setCustomUrl('');
    onChange(DEFAULT_PRODUCT_IMAGE);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrl.trim()) {
      setError('অনুগ্রহ করে একটি বৈধ ইমেজ লিংক প্রবেশ করান।');
      return;
    }
    if (!isValidProductImageUrl(customUrl)) {
      setError('লিংকটি সঠিক নয়। http:// বা https:// দিয়ে শুরু হওয়া ইমেজ লিংক দিন।');
      return;
    }
    setError(null);
    setUploadedInfo(null);
    onChange(customUrl.trim());
  };

  return (
    <div className={`bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="font-semibold text-stone-900 flex items-center gap-2 text-xs">
          <ImageIcon className="w-4 h-4 text-emerald-700" />
          <span>পণ্যের ছবি (Product Image)</span>
        </label>
        <span className="text-[10px] text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-md font-medium">
          {isDataUrl
            ? 'ডিভাইস থেকে আপলোডকৃত'
            : isPreset
            ? 'প্রিসেট ছবি'
            : isExternalUrl
            ? 'ওয়েব লিংক'
            : 'ডিফল্ট ছবি'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-lg text-[11px] font-medium">
        <button
          type="button"
          onClick={() => {
            setActiveTab('upload');
            setError(null);
          }}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-white text-emerald-900 font-bold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>ডিভাইস আপলোড</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('preset');
            setError(null);
          }}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'preset'
              ? 'bg-white text-emerald-900 font-bold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>প্রিসেট গ্যালারি</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('url');
            setError(null);
          }}
          className={`flex-1 py-1.5 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-white text-emerald-900 font-bold shadow-2xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>ইমেজ লিংক</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">ত্রুটি: </span>
            {error}
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-700"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Content Area: Side-by-side on sm screens */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Left: Live Preview */}
        <div className="w-full sm:w-32 shrink-0 flex flex-col items-center gap-2">
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-stone-300 bg-white shadow-2xs group">
            <ProductImage
              src={value}
              alt="Live Preview"
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            {isProcessing && (
              <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white text-[10px] gap-1">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>অপ্টিমাইজ হচ্ছে...</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-stone-500 font-medium text-center">
            লাইভ প্রিভিউ (Preview)
          </span>
        </div>

        {/* Right: Tab-specific Controls */}
        <div className="flex-1 w-full min-w-0">
          {/* TAB 1: DEVICE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
                    : 'border-stone-300 hover:border-emerald-500 bg-white hover:bg-stone-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-800 text-xs">
                      ছবি আপলোড করুন (Choose Image)
                    </span>
                    <span className="text-stone-500 text-xs block">বা এখানে ড্র্যাগ করে ছাড়ুন</span>
                  </div>
                  <p className="text-[10px] text-stone-400 mt-1">
                    সমর্থিত ফরম্যাট: <strong className="text-stone-600">JPG, PNG, WEBP</strong> (সর্বোচ্চ <strong className="text-stone-600">5 MB</strong>)
                  </p>
                </div>
              </div>

              {/* Uploaded Image details if available */}
              {uploadedInfo && isDataUrl && (
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between text-[11px] gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-emerald-950 truncate flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{uploadedInfo.originalName}</span>
                    </div>
                    <div className="text-[10px] text-emerald-700">
                      রেজোলিউশন: {uploadedInfo.width}×{uploadedInfo.height}px · অপ্টিমাইজড সাইজ:{' '}
                      {(uploadedInfo.optimizedSizeBytes / 1024).toFixed(1)} KB (মূল:{' '}
                      {(uploadedInfo.originalSizeBytes / (1024 * 1024)).toFixed(2)} MB)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 rounded text-[10px] font-semibold border border-emerald-300 cursor-pointer"
                    >
                      পরিবর্তন
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-700 rounded text-[10px] font-semibold border border-rose-300 cursor-pointer"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              )}

              {/* Replace / Reset if dataUrl but no current session upload info */}
              {!uploadedInfo && isDataUrl && (
                <div className="flex items-center justify-between text-[11px] p-2 bg-stone-100 rounded-lg">
                  <span className="text-stone-600 font-medium">কাস্টম আপলোডকৃত ছবি সক্রিয়</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      নতুন ছবি আপলোড
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-rose-600 font-semibold hover:underline"
                    >
                      রিসেট
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET GALLERY */}
          {activeTab === 'preset' && (
            <div className="space-y-2">
              <span className="text-[11px] text-stone-600 block">
                হাই-রেজোলিউশন গ্রামীণ খাঁটি পণ্যের প্রিসেট থেকে বেছে নিন:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1">
                {PRESET_PRODUCT_IMAGES.map((preset) => {
                  const isSelected = value === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setUploadedInfo(null);
                        setError(null);
                        onChange(preset.url);
                      }}
                      className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                          : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.title}
                        className="w-8 h-8 rounded object-cover shrink-0 bg-stone-100"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold text-stone-900 truncate">
                          {preset.title}
                        </div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {activeTab === 'url' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-stone-600 font-medium block mb-1">
                  ইমেজ ওয়েব লিংক (HTTP / HTTPS URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://example.com/product-image.jpg"
                    className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-stone-900 font-mono text-[11px] focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    প্রয়োগ করুন
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-stone-400">
                ইন্টারনেটের যে কোনো পাবলিক ইমেজ লিংক সরাসরি যুক্ত করা যাবে।
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
