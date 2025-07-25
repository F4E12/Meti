"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

interface CanvasConfig {
  id: string;
  name: string;
  width: number;
  height: number;
  templateSrc: string;
  templateImage: HTMLImageElement | null;
  templateLoaded: boolean;
  position: { x: number; y: number };
  targetX: number;
  targetY: number;
}

interface CanvasEditorProps {
  active: number;
  triggerGenerate: boolean;
  setTriggerGenerate: (val: boolean) => void;
  onTextureGenerated: (dataUrl: string) => void;
  pattern: string | null;
}

const CanvasEditor: React.FC<CanvasEditorProps> = ({
  active,
  triggerGenerate,
  setTriggerGenerate,
  onTextureGenerated,
  pattern,
}) => {
  const allShirtParts: CanvasConfig[] = [
    {
      id: "collar_inside",
      name: "Collar Inside",
      width: 726,
      height: 146,
      templateSrc: "/assets/1.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 181.5,
    },
    {
      id: "collar_outside",
      name: "Collar Outside",
      width: 726,
      height: 131,
      templateSrc: "/assets/2.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 351.5,
    },
    {
      id: "back",
      name: "Back",
      width: 681,
      height: 746,
      templateSrc: "/assets/3.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 501.5,
    },
    {
      id: "front_right",
      name: "Front Right",
      width: 681,
      height: 755,
      templateSrc: "/assets/4.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 1266.5,
    },
    {
      id: "front_left",
      name: "Front Left",
      width: 681,
      height: 652,
      templateSrc: "/assets/5.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 2055.6,
    },
    {
      id: "right_hand",
      name: "Right Hand",
      width: 686,
      height: 617,
      templateSrc: "/assets/6.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 2732.2,
    },
    {
      id: "back_bottom",
      name: "Back Bottom",
      width: 691,
      height: 611,
      templateSrc: "/assets/7.png",
      templateImage: null,
      templateLoaded: false,
      position: { x: 0, y: 0 },
      targetX: 0,
      targetY: 3392.2,
    },
  ];

  const [canvasConfigs, setCanvasConfigs] =
    useState<CanvasConfig[]>(allShirtParts);
  const [selectedPartIndex, setSelectedPartIndex] = useState<number>(active);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const patternImageRef = useRef<HTMLImageElement | null>(null);
  const basePatternLoadedRef = useRef(false);

  const drawCanvasForPart = useCallback(
    (
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
      config: CanvasConfig
    ) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (patternImageRef.current && basePatternLoadedRef.current) {
        const img = patternImageRef.current;
        const imgAspectRatio = img.width / img.height;
        const canvasAspectRatio = canvas.width / canvas.height;

        let drawWidth: number;
        let drawHeight: number;
        let offsetX: number;
        let offsetY: number;

        if (imgAspectRatio > canvasAspectRatio) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspectRatio;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspectRatio;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        offsetX += config.position.x;
        offsetY += config.position.y;

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      if (config.templateImage && config.templateLoaded) {
        ctx.drawImage(config.templateImage, 0, 0, canvas.width, canvas.height);
      }
    },
    []
  );

  useEffect(() => {
    patternImageRef.current = new Image();
    patternImageRef.current.src = pattern || "/assets/megamendung.jpg";
    patternImageRef.current.onload = () => {
      basePatternLoadedRef.current = true;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const config = canvasConfigs[selectedPartIndex];
      if (canvas && ctx && config && config.templateLoaded) {
        drawCanvasForPart(canvas, ctx, config);
      }
    };
    patternImageRef.current.onerror = () => {
      console.error("Failed to load base pattern image.");
    };

    setCanvasConfigs((prevConfigs) =>
      prevConfigs.map((config, i) => {
        const img = new Image();
        img.src = config.templateSrc;
        img.onload = () => {
          setCanvasConfigs((currentConfigs) => {
            const updated = [...currentConfigs];
            updated[i] = {
              ...updated[i],
              templateImage: img,
              templateLoaded: true,
            };
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext("2d");
            if (
              i === selectedPartIndex &&
              basePatternLoadedRef.current &&
              canvas &&
              ctx
            ) {
              drawCanvasForPart(canvas, ctx, updated[i]);
            }
            return updated;
          });
        };
        img.onerror = () => {
          console.error(`Failed to load template image: ${config.templateSrc}`);
          setCanvasConfigs((currentConfigs) => {
            const updated = [...currentConfigs];
            updated[i] = {
              ...updated[i],
              templateLoaded: true,
            };
            return updated;
          });
        };
        return { ...config, templateImage: img };
      })
    );
  }, [pattern]);

  useEffect(() => {
    setSelectedPartIndex(active);
  }, [active]);

  useEffect(() => {
    if (triggerGenerate) {
      handleGenerateAndSend();
      setTriggerGenerate(false);
    }
  }, [triggerGenerate]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.style.cursor = "grabbing";
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;

      setCanvasConfigs((prevConfigs) => {
        const updated = [...prevConfigs];
        updated[selectedPartIndex] = {
          ...updated[selectedPartIndex],
          position: {
            x: prevConfigs[selectedPartIndex].position.x + dx,
            y: prevConfigs[selectedPartIndex].position.y + dy,
          },
        };
        return updated;
      });

      lastX = e.clientX;
      lastY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    const handleMouseOut = () => {
      isDragging = false;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseout", handleMouseOut);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseout", handleMouseOut);
    };
  }, [selectedPartIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const config = canvasConfigs[selectedPartIndex];

    if (
      canvas &&
      ctx &&
      config &&
      basePatternLoadedRef.current &&
      config.templateLoaded
    ) {
      drawCanvasForPart(canvas, ctx, config);
    }
  }, [selectedPartIndex, canvasConfigs, drawCanvasForPart]);

  const handleGenerateAndSend = async () => {
    const imagesToSend = [];

    for (const [i, config] of canvasConfigs.entries()) {
      if (!basePatternLoadedRef.current || !config.templateLoaded) {
        console.warn(
          `Skipping part ${config.name} (index ${i}) because images are not loaded.`
        );
        continue;
      }

      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = config.width;
      offscreenCanvas.height = config.height;
      const offscreenCtx = offscreenCanvas.getContext("2d");

      if (offscreenCtx) {
        drawCanvasForPart(offscreenCanvas, offscreenCtx, config);
        const dataURL = offscreenCanvas.toDataURL("image/png");
        const base64Data = dataURL.replace(/^data:image\/png;base64,/, "");

        imagesToSend.push({
          imageData: base64Data,
          x: config.targetX,
          y: config.targetY,
        });
      }
    }

    if (imagesToSend.length === 0) {
      alert(
        "No images to send. Make sure all patterns and templates are loaded."
      );
      return;
    }

    const payload = {
      images: imagesToSend,
      final_width: 4096,
      final_height: 4096,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/composite_images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.final_image_base64) {
        const dataUrl = `data:image/png;base64,${result.final_image_base64}`;
        onTextureGenerated(dataUrl);
      } else {
        alert("Image sent to Flask, but no image returned.");
      }
    } catch (error) {
      console.error("Error sending data to Flask:", error);
      alert("Failed to send image data to Flask. Check console for details.");
    }
  };

  const currentConfig = canvasConfigs[selectedPartIndex];

  return (
    <div className="h-full p-5">
      {currentConfig ? (
        <div className="h-full justify-center flex flex-col items-center">
          <canvas
            ref={canvasRef}
            className="max-w-80 max-h-80"
            width={currentConfig.width}
            height={currentConfig.height}
            style={{
              border: "1px solid #ccc",
              cursor: "grab",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      ) : (
        <p>Loading shirt parts...</p>
      )}
    </div>
  );
};

export default CanvasEditor;
