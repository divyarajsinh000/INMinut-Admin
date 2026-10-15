import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "react-toastify";
import { formatErrorMessage } from "../utils/errorMessage";

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

const getRotatedSize = (width, height, rotation) => {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
};

const getCroppedImageFile = async (imageSrc, cropPixels, rotation, sourceFile) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Could not create crop canvas");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = getRotatedSize(image.width, image.height, rotation);

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) throw new Error("Could not create cropped canvas");

  croppedCanvas.width = cropPixels.width;
  croppedCanvas.height = cropPixels.height;

  croppedCtx.drawImage(
    canvas,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    cropPixels.width,
    cropPixels.height
  );

  const outputType = sourceFile?.type === "image/png" ? "image/png" : "image/jpeg";
  const quality = outputType === "image/jpeg" ? 0.92 : undefined;

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to crop image"));
          return;
        }

        const originalName = sourceFile?.name || "cropped-image.jpg";
        const extension = outputType === "image/png" ? "png" : "jpg";
        const safeName = originalName.replace(/\.[^/.]+$/, "");
        const croppedFile = new File([blob], `${safeName}-cropped.${extension}`, {
          type: outputType,
          lastModified: Date.now(),
        });
        resolve(croppedFile);
      },
      outputType,
      quality
    );
  });
};

const ImageCropModal = ({
  file,
  title = "Crop Image",
  aspect: initialAspect = 16 / 9,
  cropShape = "rect",
  onCropDone,
  onUseOriginal,
  onCancel,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentAspect, setCurrentAspect] = useState(initialAspect);

  const presetAspects = [
    { label: "16:9", value: 16 / 9 },
    { label: "9:16", value: 9 / 16 },
    { label: "1:1", value: 1 },
    { label: "Free", value: undefined },
  ];

  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    setCurrentAspect(initialAspect);
  }, [file, initialAspect]);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleCrop = async () => {
    if (!file || !imageUrl || !croppedAreaPixels) return;

    try {
      setProcessing(true);
      const croppedFile = await getCroppedImageFile(imageUrl, croppedAreaPixels, rotation, file);
      onCropDone?.(croppedFile);
    } catch (error) {
      toast.error(formatErrorMessage(error, "Failed to crop image"));
    } finally {
      setProcessing(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative my-auto flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0 pr-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900">{title}</h2>
            <p className="text-xs font-semibold text-slate-500 truncate max-w-[220px] sm:max-w-md">{file.name}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="shrink-0 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="relative h-[250px] xs:h-[300px] sm:h-[400px] shrink-0 bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            minZoom={0.1}
            rotation={rotation}
            aspect={currentAspect}
            cropShape={cropShape}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 p-4 sm:p-5 custom-scrollbar">
          <div className="flex flex-wrap gap-2">
            {presetAspects.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setCurrentAspect(preset.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  currentAspect === preset.value
                    ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                <span>Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                <span>Rotate</span>
                <span>{rotation}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-red-500"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end border-t border-slate-200 p-3 sm:px-5 bg-slate-50/50">
          <button
            type="button"
            onClick={onUseOriginal}
            disabled={processing}
            className="w-full sm:w-auto rounded-xl bg-slate-100 px-5 py-2.5 text-xs sm:text-sm font-black text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            Use Original
          </button>
          <button
            type="button"
            onClick={handleCrop}
            disabled={processing}
            className="w-full sm:w-auto rounded-xl bg-red-500 px-6 py-2.5 text-xs sm:text-sm font-black text-white hover:bg-red-600 disabled:opacity-60 shadow-lg shadow-red-500/20"
          >
            {processing ? "Cropping..." : "Apply Crop"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
