"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface ThreeShirtViewerProps {
  initialTextureUrl?: string;
  gltfModelPath?: string;
  combinedTextureFromCanvas?: string | null;
}

const ThreeShirtViewer: React.FC<ThreeShirtViewerProps> = ({
  initialTextureUrl = "/assets/SHIRT_COLOR.png",
  gltfModelPath = "/assets/SHIRT.gltf",
  combinedTextureFromCanvas,
}) => {
  const threeJsWrapperRef = useRef<HTMLDivElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  const [currentTexture, setCurrentTexture] = useState<THREE.Texture | null>(
    null
  );

  useEffect(() => {
    if (!threeJsWrapperRef.current) return;

    const wrapper = threeJsWrapperRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd1d5db);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      wrapper.clientWidth / wrapper.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 6, 4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(wrapper.clientWidth, wrapper.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrapper.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 6.5, 0);
    controls.update();
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      initialTextureUrl,
      (texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        setCurrentTexture(texture);
      },
      undefined,
      (err) => console.error("Initial texture load error:", err)
    );

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      gltfModelPath,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(5, 5, 5);
        model.position.set(0, 0, 0);

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (currentTexture) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.map = currentTexture;
                child.material.needsUpdate = true;
              } else {
                child.material = new THREE.MeshStandardMaterial({
                  map: currentTexture,
                  side: THREE.DoubleSide,
                });
              }
            }
          }
        });

        scene.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("An error occurred while loading the GLTF model:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (
        threeJsWrapperRef.current &&
        cameraRef.current &&
        rendererRef.current
      ) {
        const width = threeJsWrapperRef.current.clientWidth;
        const height = threeJsWrapperRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (currentTexture) {
        currentTexture.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (combinedTextureFromCanvas && modelRef.current && rendererRef.current) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        combinedTextureFromCanvas,
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.flipY = false;
          texture.needsUpdate = true;

          modelRef.current?.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              if (child.material instanceof THREE.MeshStandardMaterial) {
                if (currentTexture && currentTexture !== texture) {
                  currentTexture.dispose();
                }
                setCurrentTexture(texture);
                child.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  side: THREE.DoubleSide,
                });
                child.material.needsUpdate = true;
              } else {
                const oldMaterial = child.material;
                child.material = new THREE.MeshBasicMaterial({
                  map: texture,
                  side: THREE.DoubleSide,
                });
                oldMaterial.dispose();
                if (currentTexture && currentTexture !== texture) {
                  currentTexture.dispose();
                }
                setCurrentTexture(texture);
                child.material.needsUpdate = true;
              }
            }
          });
          rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
        },
        undefined,
        (err) => console.error("Error loading combined texture:", err)
      );
    }
  }, [combinedTextureFromCanvas, modelRef.current]);

  const handleTextureUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.onload = () => {
          const uploadedTexture = new THREE.Texture(image);
          uploadedTexture.flipY = false;
          uploadedTexture.wrapS = THREE.RepeatWrapping;
          uploadedTexture.wrapT = THREE.RepeatWrapping;
          uploadedTexture.needsUpdate = true;

          sceneRef.current?.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material) {
              if (currentTexture && currentTexture !== uploadedTexture) {
                currentTexture.dispose();
              }

              if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.map = uploadedTexture;
                child.material.needsUpdate = true;
              } else {
                const oldMaterial = child.material;
                child.material = new THREE.MeshStandardMaterial({
                  map: uploadedTexture,
                  side: THREE.DoubleSide,
                });
                oldMaterial.dispose();
              }
            }
          });
          setCurrentTexture(uploadedTexture);
          rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
        };
        image.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [currentTexture]
  );

  const handleRemoveTexture = useCallback(() => {
    sceneRef.current?.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (child.material instanceof THREE.MeshStandardMaterial) {
          if (child.material.map) {
            child.material.map.dispose();
            child.material.map = null;
            child.material.needsUpdate = true;
          }
        } else {
          if (child.material.map) {
            child.material.map.dispose();
            child.material.map = null;
            child.material.needsUpdate = true;
          }
        }
      }
    });
    if (currentTexture) {
      currentTexture.dispose();
      setCurrentTexture(null);
    }
    rendererRef.current?.render(sceneRef.current!, cameraRef.current!);
  }, [currentTexture]);

  return (
    <div>
      <div
        id="threejs-wrapper"
        ref={threeJsWrapperRef}
        className="w-[360px] h-[360px]"
      />
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <input
          type="file"
          id="textureInput"
          ref={textureInputRef}
          accept="image/*"
          onChange={handleTextureUpload}
        />
        <button onClick={handleRemoveTexture}>Remove Texture</button>
      </div>
    </div>
  );
};

export default ThreeShirtViewer;
