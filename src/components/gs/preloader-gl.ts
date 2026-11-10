/*
 * Scène WebGL du preloader — chargée dynamiquement.
 * Particules en shader GLSL : nuage bruité (simplex) → convergence en globe → explosion.
 */
import * as THREE from "three";

const vert = /* glsl */ `
uniform float uTime, uProg, uExplode, uPixel;
uniform vec2 uMouse;
attribute vec3 aTarget;
attribute float aSeed;
varying float vSeed;
varying float vAlpha;
// Bruit simplex 3D (Ashima Arts / Stefan Gustavson, licence MIT)
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+2.0*C.xxx;vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
mat3 rotY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,-s,0.,1.,0.,s,0.,c);}
void main(){
  vec3 p=position;
  float t=uTime*0.25;
  p+=vec3(snoise(p*0.6+t),snoise(p*0.6+t+11.0),snoise(p*0.6+t+23.0))*0.6;
  float k=smoothstep(0.0,1.0,clamp(uProg*1.15-aSeed*0.15,0.0,1.0));
  vec3 target=rotY(uTime*0.35)*aTarget;
  vec3 pos=mix(p,target,k);
  pos+=normalize(pos+0.001)*uExplode*(2.5+aSeed*4.0);
  vec4 mv=modelViewMatrix*vec4(pos,1.0);
  // Répulsion souris (dans l'espace vue)
  vec2 d=mv.xy-uMouse;float f=exp(-dot(d,d)*1.6);
  mv.xy+=normalize(d+0.0001)*f*0.55;
  gl_Position=projectionMatrix*mv;
  gl_PointSize=(1.4+aSeed*2.6)*uPixel*(6.0/-mv.z)*(1.0+uExplode);
  vSeed=aSeed;
  vAlpha=(0.55+0.45*k)*(1.0-uExplode);
}`;

const frag = /* glsl */ `
uniform vec3 uA, uB, uC;
varying float vSeed;
varying float vAlpha;
void main(){
  float d=length(gl_PointCoord-0.5);
  float glow=exp(-d*d*18.0)+0.35*exp(-d*7.0);
  vec3 col=mix(uA,uB,smoothstep(0.2,0.9,vSeed));
  col=mix(col,uC,step(0.93,vSeed));
  gl_FragColor=vec4(col*glow,glow*vAlpha);
}`;

export function createPreloaderScene(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  const dpr = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(innerWidth, innerHeight, false);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 50);
  camera.position.z = 6;

  // Nombre de particules adapté à l'appareil
  const cores = navigator.hardwareConcurrency ?? 4;
  const small = innerWidth < 768;
  const N = small ? 6000 : cores >= 8 ? 18000 : 11000;

  const pos = new Float32Array(N * 3),
    tgt = new Float32Array(N * 3),
    seed = new Float32Array(N);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const R = small ? 1.35 : 1.7;
  for (let i = 0; i < N; i++) {
    const r = 3 + Math.random() * 4,
      th = Math.random() * Math.PI * 2,
      ph = Math.acos(2 * Math.random() - 1);
    pos.set(
      [r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph) - 1],
      i * 3,
    );
    const y = 1 - (i / (N - 1)) * 2,
      rad = Math.sqrt(1 - y * y),
      a = golden * i;
    tgt.set([Math.cos(a) * rad * R, y * R, Math.sin(a) * rad * R], i * 3);
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aTarget", new THREE.BufferAttribute(tgt, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const uniforms = {
    uTime: { value: 0 },
    uProg: { value: 0 },
    uExplode: { value: 0 },
    uPixel: { value: dpr },
    uMouse: { value: new THREE.Vector2(99, 99) },
    uA: { value: new THREE.Color("#F0532A") },
    uB: { value: new THREE.Color("#F6D9A8") },
    uC: { value: new THREE.Color("#5C7CFF") },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);
  renderer.compile(scene, camera); // compilation réelle des shaders

  const target = new THREE.Vector2(99, 99);
  const onMove = (e: PointerEvent) => {
    const h = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    target.set(
      ((e.clientX / innerWidth) * 2 - 1) * h * camera.aspect,
      (-(e.clientY / innerHeight) * 2 + 1) * h,
    );
  };
  const onTilt = (e: DeviceOrientationEvent) => {
    if (e.gamma == null || e.beta == null) return;
    target.set((e.gamma / 45) * 1.2, (-(e.beta - 45) / 45) * 1.2);
  };
  const onResize = () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight, false);
  };
  addEventListener("pointermove", onMove);
  addEventListener("deviceorientation", onTilt);
  addEventListener("resize", onResize);

  let raf = 0;
  const clock = new THREE.Clock();
  const loop = () => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uMouse.value.lerp(target, 0.12);
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  };
  const onVis = () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) loop();
  };
  document.addEventListener("visibilitychange", onVis);
  loop();

  return {
    uniforms,
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onMove);
      removeEventListener("deviceorientation", onTilt);
      removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
