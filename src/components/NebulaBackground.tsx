import { useEffect, useRef } from 'react';

const vertexShaderSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

// 3D Simplex Noise
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){ 
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + 1.0 * C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

  i = mod(i, 289.0 ); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 1.0/7.0;
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

mat3 m3 = mat3( 0.00,  0.80,  0.60,
              -0.80,  0.36, -0.48,
              -0.60, -0.48,  0.64 );

float fbm(vec3 p) {
    float f = 0.0;
    float amp = 0.5;
    for(int i = 0; i < 3; i++) {
        f += amp * snoise(p);
        p = m3 * p * 2.01;
        amp *= 0.4;
    }
    return f;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float aspect = u_resolution.x / u_resolution.y;
    vec2 st = uv;
    st.x *= aspect;

    // Much larger scale for broader sweeps
    st *= 0.8;

    // Slow, evolving time for Z-axis
    float t = u_time * 0.04;

    // Domain warping using 3D FBM
    vec3 q = vec3(0.0);
    q.x = fbm(vec3(st, t));
    q.y = fbm(vec3(st + vec2(1.0), t * 0.8));

    vec3 r = vec3(0.0);
    r.x = fbm(vec3(st + 1.0 * q.xy + vec2(1.7, 9.2), t * 1.1));
    r.y = fbm(vec3(st + 1.0 * q.xy + vec2(8.3, 2.8), t * 0.9));

    float f = fbm(vec3(st + r.xy, t));

    // Map f to [0, 1] range for smoother color mixing
    f = f * 0.5 + 0.5;

    // Color palette for pink galaxy
    vec3 col4 = vec3(0.12, 0.01, 0.08);  // Deep magenta base
    vec3 col3 = vec3(0.55, 0.1, 0.35);   // Magenta
    vec3 col2 = vec3(1.0, 0.71, 0.76);   // Soft pink (#FFB6C1)
    vec3 col1 = vec3(1.0, 0.82, 0.86);   // Light pink (#FFD1DC)

    // Liquid-smooth blending
    vec3 color = mix(col4, col3, smoothstep(0.1, 0.9, f));
    color = mix(color, col2, smoothstep(0.0, 1.2, length(q.xy)));
    color = mix(color, col1, smoothstep(0.3, 1.4, length(r.xy)));

    // Soft glowing regions
    color += col2 * smoothstep(0.3, 0.8, f) * 1.2;

    // Subtle star field in background
    float star = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
    float starT = pow(star, 150.0);
    float twinkle = sin(u_time * 1.5 + star * 100.0) * 0.5 + 0.5;
    color += starT * vec3(1.0) * twinkle * 1.0;

    // Smooth vignette
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    color *= smoothstep(0.0, 0.2, vignette * 10.0);

    gl_FragColor = vec4(color, 1.0);
}
`;

const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
  const shader = gl.createShader(type);
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

const NebulaBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Optimize for mobile by turning off depth/antialias
    const gl = canvas.getContext('webgl', { alpha: false, depth: false, antialias: false });
    if (!gl) return;

    const vShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vShader || !fShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      -1, 1,
      1, -1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    let animationId: number;
    let startTime = Date.now();

    const resize = () => {
      // Cap DPR at 1 for significant performance boost on high-DPI displays (Retina/Mobile)
      // Since it's a soft nebula, the lower internal resolution is imperceptible and fixes lag.
      const dpr = 1;
      canvas.width = globalThis.innerWidth * dpr;
      canvas.height = globalThis.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    globalThis.addEventListener('resize', resize);
    resize();

    const render = () => {
      gl.useProgram(program);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, (Date.now() - startTime) / 1000);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      globalThis.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default NebulaBackground;
