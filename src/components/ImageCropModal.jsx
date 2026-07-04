import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "react-toastify";

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
      toast.error(error?.message || "Failed to crop image");
    } finally {
      setProcessing(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">{title}</h2>
            <p className="text-xs font-semibold text-slate-500 break-all">{file.name}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={processing}
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <div className="relative h-[420px] bg-slate-900">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
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

        <div className="space-y-4 border-t border-slate-200 p-5">
          <div className="flex flex-wrap gap-2 mb-2">
            {presetAspects.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setCurrentAspect(preset.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  currentAspect === preset.value
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-500">
                <span>Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min={1}
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onUseOriginal}
              disabled={processing}
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-200 disabled:opacity-60"
            >
              Use Original
            </button>
            <button
              type="button"
              onClick={handleCrop}
              disabled={processing}
              className="rounded-xl bg-red-500 px-6 py-3 text-sm font-black text-white hover:bg-red-600 disabled:opacity-60"
            >
              {processing ? "Cropping..." : "Apply Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
