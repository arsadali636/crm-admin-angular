import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  X,
  Star,
  Trash2,
  RefreshCw,
  GripVertical,
  AlertCircle,
  Loader2,
  Edit2
} from "lucide-react";
import { getCompleteUrlV1 } from "../utils";

interface GalleryItem {
  id: string;
  url: string;
  file?: File;
  status: "idle" | "uploading" | "success" | "error";
  progress: number;
  errorMsg?: string;
  name: string;
  size: number;
}

interface ProductGalleryUploaderProps {
  maxImages?: number;
  maxSize?: number; // in MB
  acceptedFormats?: string[];
  multiple?: boolean;
  defaultImages?: string[];
  primaryImage?: string;
  editable?: boolean;
  onUpload?: (urls: string[]) => void;
  onDelete?: (url: string) => void;
  onReorder?: (urls: string[]) => void;
  onPrimaryChange?: (url: string) => void;
}

// XHR upload function to handle progress tracking
const uploadFileWithProgress = (
  file: File,
  onProgress: (percent: number) => void,
  onSuccess: (url: string) => void,
  onError: (err: string) => void
) => {
  const xhr = new XMLHttpRequest();
  const uploadUrl = getCompleteUrlV1("feature/upload-image");
  const formData = new FormData();
  formData.append("image", file);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      onProgress(percent);
    }
  };

  xhr.onload = () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const res = JSON.parse(xhr.responseText);
        if (res.data?.[0] === "ERROR_IMAGE_URL") {
          onError("Image upload failed");
        } else {
          onSuccess(res.data?.[0]);
        }
      } catch (_) {
        onError("Upload failed: Invalid response");
      }
    } else {
      onError(`Upload failed (Status: ${xhr.status})`);
    }
  };

  xhr.onerror = () => {
    onError("Network error occurred");
  };

  const userStorage = localStorage.getItem("user");
  xhr.open("POST", uploadUrl);
  if (userStorage) {
    try {
      const { token } = JSON.parse(userStorage);
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    } catch (_) {}
  }
  xhr.send(formData);
};

export const ProductGalleryUploader: React.FC<ProductGalleryUploaderProps> = ({
  maxImages = 10,
  maxSize = 2,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp"],
  multiple = true,
  defaultImages = [],
  primaryImage = "",
  editable = true,
  onUpload,
  onDelete,
  onReorder,
  onPrimaryChange,
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Sync prop defaultImages with local state
  useEffect(() => {
    if (defaultImages && defaultImages.length > 0) {
      setItems((prev) => {
        const synced = defaultImages.map((url, idx) => {
          const existing = prev.find((item) => item.url === url);
          if (existing) return existing;
          return {
            id: `default-${idx}-${url}`,
            url,
            status: "success" as const,
            progress: 100,
            name: url.split("/").pop() || `Product Image ${idx + 1}`,
            size: 0,
          };
        });

        // Retain uploading and failed items
        const pending = prev.filter(
          (item) => item.status === "uploading" || item.status === "error"
        );
        return [...synced, ...pending];
      });
    } else {
      setItems((prev) => prev.filter((item) => item.status === "uploading"));
    }
  }, [defaultImages]);

  // Format image size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "Unknown size";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // Check validation rules
  const validateFile = (file: File): string | null => {
    if (!acceptedFormats.includes(file.type)) {
      return "Unsupported file format. Please upload JPG, PNG or WEBP.";
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File size is too large. Max limit is ${maxSize}MB.`;
    }
    return null;
  };

  const uploadItem = (file: File, replaceIdx?: number) => {
    const itemId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newItem: GalleryItem = {
      id: itemId,
      url: "",
      file,
      status: "uploading",
      progress: 0,
      name: file.name,
      size: file.size,
    };

    setItems((prev) => {
      const updated = [...prev];
      if (replaceIdx !== undefined && replaceIdx >= 0 && replaceIdx < updated.length) {
        updated[replaceIdx] = newItem;
      } else {
        updated.push(newItem);
      }
      return updated;
    });

    const onProgress = (percent: number) => {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, progress: percent } : item))
      );
    };

    const onSuccess = (url: string) => {
      setItems((prev) => {
        const nextItems = prev.map((item) =>
          item.id === itemId ? { ...item, status: "success" as const, url, progress: 100 } : item
        );

        // Notify parent of successful URLs
        const successUrls = nextItems
          .filter((item) => item.status === "success")
          .map((item) => item.url);
        
        onUpload?.(successUrls);

        // Set as primary by default if none is set
        if (!primaryImage && successUrls.length > 0) {
          onPrimaryChange?.(successUrls[0]);
        }

        return nextItems;
      });
    };

    const onError = (errorMsg: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: "error" as const, errorMsg } : item
        )
      );
    };

    uploadFileWithProgress(file, onProgress, onSuccess, onError);
  };

  // Handle files selection/dropping
  const handleFiles = (files: File[]) => {
    const currentCount = items.filter((i) => i.status === "success" || i.status === "uploading").length;
    const allowedCount = maxImages - currentCount;

    if (allowedCount <= 0) {
      alert(`Limit reached. Maximum ${maxImages} images allowed.`);
      return;
    }

    const filesToUpload = files.slice(0, allowedCount);
    filesToUpload.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        // Create an item in error state immediately
        const errorItemId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setItems((prev) => [
          ...prev,
          {
            id: errorItemId,
            url: "",
            status: "error",
            progress: 0,
            errorMsg: error,
            name: file.name,
            size: file.size,
          },
        ]);
      } else {
        uploadItem(file);
      }
    });
  };

  // Drag and drop handlers for upload box
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    }
  };

  // Paste handler
  useEffect(() => {
    const handleWindowPaste = (e: ClipboardEvent) => {
      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        const files = Array.from(e.clipboardData.files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (files.length > 0) {
          handleFiles(files);
        }
      }
    };
    window.addEventListener("paste", handleWindowPaste);
    return () => window.removeEventListener("paste", handleWindowPaste);
  }, [items]);

  // Remove/Delete image
  const handleDelete = (id: string, url: string) => {
    setItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id);
      if (url) {
        onDelete?.(url);
        // If the primary image was deleted, assign the next available one
        if (primaryImage === url) {
          const firstLeft = nextItems.find((item) => item.status === "success");
          onPrimaryChange?.(firstLeft ? firstLeft.url : "");
        }
      }
      return nextItems;
    });
  };

  // Retry failed upload
  const handleRetry = (item: GalleryItem) => {
    if (item.file) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      uploadItem(item.file);
    }
  };

  // Replace image
  const triggerReplace = (index: number) => {
    setReplaceIndex(index);
    replaceInputRef.current?.click();
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (replaceIndex === null) return;
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) {
        alert(error);
      } else {
        uploadItem(file, replaceIndex);
      }
    }
    setReplaceIndex(null);
    if (replaceInputRef.current) replaceInputRef.current.value = "";
  };

  // Thumbnail reordering handlers
  const onCardDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onCardDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    // Direct visual swapping
    setItems((prev) => {
      const updated = [...prev];
      const draggedItem = updated[draggedIndex];
      updated.splice(draggedIndex, 1);
      updated.splice(index, 0, draggedItem);
      setDraggedIndex(index);
      return updated;
    });
  };

  const onCardDragEnd = () => {
    setDraggedIndex(null);
    const successUrls = items
      .filter((item) => item.status === "success")
      .map((item) => item.url);
    onReorder?.(successUrls);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700">Product Gallery</label>
        <span className="text-[10px] font-bold text-slate-400">
          {items.filter((i) => i.status === "success").length} / {maxImages} Images
        </span>
      </div>

      {/* Grid of image preview cards */}
      <AnimatePresence mode="popLayout">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item, index) => {
            const isPrimary = item.url === primaryImage && item.status === "success";
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                draggable={editable && item.status === "success"}
                onDragStart={(e: any) => onCardDragStart(e, index)}
                onDragOver={(e: any) => onCardDragOver(e, index)}
                onDragEnd={onCardDragEnd}
                className={`relative group rounded-2xl overflow-hidden border-2 bg-slate-50 flex flex-col justify-between aspect-square select-none transition-all duration-300 ${
                  isPrimary
                    ? "border-blue-600 shadow-md shadow-blue-500/5 bg-blue-50/10"
                    : draggedIndex === index
                    ? "border-dashed border-slate-300 opacity-50 bg-slate-100"
                    : "border-slate-200 hover:border-blue-400/80 hover:shadow-sm"
                }`}
              >
                {/* Image numbering */}
                <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-lg bg-slate-900/60 backdrop-blur-sm text-[9px] font-extrabold text-white">
                  Image {index + 1}
                </div>

                {/* Primary Image Star Badge */}
                {isPrimary && (
                  <div className={`absolute top-2.5 z-10 p-1.5 rounded-full bg-blue-600 text-white shadow transition-all duration-200 ${editable && item.status === "success" ? "right-9" : "right-2.5"}`}>
                    <Star size={10} fill="currentColor" />
                  </div>
                )}

                {/* Close/Cancel Button */}
                {editable && item.status === "success" && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.url);
                    }}
                    className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-slate-900/60 hover:bg-rose-600 backdrop-blur-sm text-white shadow transition-all duration-200 cursor-pointer"
                    title="Delete Image"
                  >
                    <X size={10} />
                  </button>
                )}

                {/* Thumbnail Preview Area */}
                <div className="relative flex-1 flex items-center justify-center overflow-hidden">
                  {item.status === "success" && item.url ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : item.file ? (
                    <img
                      src={URL.createObjectURL(item.file)}
                      alt={item.name}
                      className="w-full h-full object-cover opacity-60 filter blur-[1px]"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <AlertCircle size={24} />
                    </div>
                  )}

                  {/* Drag Handle Overlay (Visible on Hover) */}
                  {editable && item.status === "success" && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-slate-900/40 backdrop-blur-sm text-white pointer-events-none cursor-grab">
                      <GripVertical size={16} />
                    </div>
                  )}

                  {/* Actions Overlay (Visible on Hover) */}
                  {editable && item.status === "success" && (
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-2.5 gap-2">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPrimaryChange?.(item.url)}
                          className={`flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg text-[9px] font-bold transition-colors cursor-pointer ${
                            isPrimary
                              ? "bg-blue-600 text-white"
                              : "bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <Star size={10} fill={isPrimary ? "currentColor" : "none"} />
                          Primary
                        </button>
                        <button
                          type="button"
                          onClick={() => triggerReplace(index)}
                          className="p-1.5 bg-white text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Replace Image"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.url)}
                          className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                          title="Delete Image"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploading Progress Overlay */}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-white gap-2">
                      <Loader2 className="animate-spin text-blue-400" size={20} />
                      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold">{item.progress}%</span>
                    </div>
                  )}

                  {/* Error Overlay */}
                  {item.status === "error" && (
                    <div className="absolute inset-0 bg-rose-950/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-3 text-white gap-2 text-center">
                      <AlertCircle size={20} className="text-rose-400" />
                      <p className="text-[9px] font-bold leading-normal text-rose-200 line-clamp-2">
                        {item.errorMsg || "Upload failed"}
                      </p>
                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          type="button"
                          onClick={() => handleRetry(item)}
                          className="p-1 bg-white/20 hover:bg-white/35 rounded text-white cursor-pointer"
                          title="Retry"
                        >
                          <RefreshCw size={10} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, "")}
                          className="p-1 bg-rose-600 hover:bg-rose-700 rounded text-white cursor-pointer"
                          title="Delete"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer details (Name & Size) */}
                <div className="p-2 border-t border-slate-100 bg-white select-none">
                  <p className="text-[9px] font-semibold text-slate-700 truncate">{item.name}</p>
                  <p className="text-[8px] font-medium text-slate-400 mt-0.5">
                    {item.size > 0 ? formatBytes(item.size) : "Cloud Image"}
                  </p>
                </div>
              </motion.div>
            );
          })}

          {/* Plus Add More Button card in grid (if has items and not reached limit) */}
          {editable && items.length > 0 && items.length < maxImages && (
            <motion.div
              layout
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 hover:bg-blue-50/5 cursor-pointer aspect-square transition-all duration-300 text-slate-400 hover:text-blue-500"
            >
              <UploadCloud size={24} className="mb-1" />
              <span className="text-[10px] font-bold">Add More</span>
            </motion.div>
          )}
        </div>
      </AnimatePresence>

      {/* Main Empty State Dropzone Box */}
      {items.length === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3.5 ${
            isDragActive
              ? "border-blue-500 bg-blue-50/50 scale-[0.99] shadow-sm shadow-blue-500/5"
              : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/10 hover:shadow-sm"
          }`}
        >
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 transition-colors">
            <UploadCloud size={32} className="text-blue-500 animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Drag & drop product images here, or{" "}
              <span className="text-blue-600 hover:underline">Browse Files</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Supports JPG, PNG, WEBP (Max {maxSize}MB each) | Up to {maxImages} Images
            </p>
            <p className="text-[9px] text-slate-400/80 mt-0.5">
              Tip: You can also copy an image and paste it directly (Ctrl+V/Cmd+V)
            </p>
          </div>
        </div>
      )}

      {/* Hidden File inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        multiple={multiple}
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(Array.from(e.target.files));
          }
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        className="hidden"
      />

      <input
        ref={replaceInputRef}
        type="file"
        accept={acceptedFormats.join(",")}
        onChange={handleReplaceFile}
        className="hidden"
      />
    </div>
  );
};
