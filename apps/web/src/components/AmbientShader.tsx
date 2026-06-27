"use client";

import React, { useEffect, useRef } from "react";

interface AmbientShaderProps {
  className?: string;
  type?: "blobs" | "flowing";
}

export const AmbientShader: React.FC<AmbientShaderProps> = ({
  className = "",
  type = "blobs",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    let animationFrameId: number;

    const vs = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsBlobs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      varying vec2 v_texCoord;

      void main() {
          vec2 uv = v_texCoord;
          vec2 p = (uv * 2.0 - 1.0);
          p.x *= u_resolution.x / u_resolution.y;
          
          float time = u_time * 0.2;
          vec3 color = vec3(0.035, 0.035, 0.043);
          
          // Purple Blob
          float d1 = length(p - vec2(sin(time)*0.5, cos(time)*0.3));
          float glow1 = 0.05 / (d1 * d1 + 0.1);
          color += glow1 * vec3(0.35, 0.22, 0.93);
          
          // Blue Blob
          float d2 = length(p - vec2(cos(time*0.8)*0.7, sin(time*1.2)*0.4));
          float glow2 = 0.04 / (d2 * d2 + 0.15);
          color += glow2 * vec3(0.13, 0.83, 0.93);
          
          // Violet Blob
          float d3 = length(p - vec2(sin(time*1.5)*-0.6, cos(time*0.5)*-0.5));
          float glow3 = 0.03 / (d3 * d3 + 0.2);
          color += glow3 * vec3(0.48, 0.23, 0.93);

          gl_FragColor = vec4(color * 0.4, 1.0);
      }
    `;

    const fsFlowing = `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
          vec2 uv = v_texCoord;
          
          float noise = sin(uv.x * 3.0 + u_time * 0.5) * cos(uv.y * 2.0 + u_time * 0.3);
          noise += sin(uv.y * 5.0 - u_time * 0.7) * cos(uv.x * 4.0 + u_time * 0.4);
          
          vec3 color1 = vec3(0.42, 0.30, 1.0); // Primary Purple
          vec3 color2 = vec3(0.27, 0.94, 0.74); // Secondary Teal
          vec3 bgColor = vec3(0.08, 0.07, 0.11);
          
          vec3 finalColor = mix(color1, color2, noise * 0.5 + 0.5);
          finalColor = mix(bgColor, finalColor, 0.3 + 0.2 * noise);
          
          float dist = distance(uv, vec2(0.5));
          finalColor *= 1.0 - dist * 0.6;
          
          gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const fsSource = type === "flowing" ? fsFlowing : fsBlobs;

    const compileShader = (shaderType: number, source: string) => {
      const shader = gl.createShader(shaderType);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const program = gl.createProgram();
    if (!program) return;

    const vertexShader = compileShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uResLoc = gl.getUniformLocation(program, "u_resolution");

    const resize = () => {
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(canvas);
    }
    resize();

    const render = (t: number) => {
      if (!canvas) return;
      gl.uniform1f(uTimeLoc, t * 0.001);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [type]);

  return <canvas ref={canvasRef} className={`w-full h-full ${className}`} />;
};
