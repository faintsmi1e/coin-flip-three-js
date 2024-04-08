import './style.css';
import * as THREE from 'three';

import {
  createExtrudeShape,
  createPointsFromImageData,
  getImageData,
} from './test';
import gsap from 'gsap';

/*
 * Setup
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffe8dc);
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.setZ(20);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#app'),
});
//renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

/*
 * Lighting
 */
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

/*
 * Coin Setup
 */
const textureLoader = new THREE.TextureLoader();
const coinTexture = textureLoader.load('./p.jpg'); // Ensure you have an image at this path
const coinMaterial = new THREE.MeshLambertMaterial({ map: coinTexture });
// const coinGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 20, 20, false);
//const imageData = await getImageData('./a.png');
//const points3d = createPointsFromImageData(imageData);
//console.log(points3d.length);
//const geometry = new THREE.BufferGeometry();

const uvs = [];
const bounds = {
  minX: Infinity,
  maxX: -Infinity,
  minY: Infinity,
  maxY: -Infinity,
};

// // First calculate bounds
// points3d.forEach((point) => {
//   if (point.x < bounds.minX) bounds.minX = point.x;
//   if (point.x > bounds.maxX) bounds.maxX = point.x;
//   if (point.z < bounds.minY) bounds.minY = point.z;
//   if (point.z > bounds.maxY) bounds.maxY = point.z;
// });

// // Then map points to UV coordinates
// points3d.forEach((point) => {
//   const u = (point.x - bounds.minX) / (bounds.maxX - bounds.minX);
//   const v = (point.z - bounds.minY) / (bounds.maxY - bounds.minY);
//   uvs.push(u, v);
// });

// geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
//const shape = createExtrudeShape(imageData);
//const coordinates = points3d.map((p) => [p.x, p.z]); // Assuming y is up and points lie on the xz-plane

// Perform Delaunay triangulation
// const delaunay = Delaunator.from(coordinates);
// const indices = delaunay.triangles;

// geometry.setFromPoints(points3d);
// geometry.setIndex(new THREE.BufferAttribute(indices, 1));

// geometry.computeVertexNormals();
// geometry.setAttribute(
//   'position',
//   new THREE.Float32BufferAttribute(
//     points3d.flatMap((p) => [p.x, p.y, p.x]),
//     2
//   )
// );

//const geometry = new THREE.BoxGeometry();
//console.log('Number of vertices:', points3d.length);
//console.log('Buffer is:', geometry.attributes.position.array.length);

const extrudeSettings = {
  steps: 1,
  depth: 1, // Small depth for a flat appearance
  bevelEnabled: false, // No bevel for a sharp-edged look
};

//const geometry = new THREE.ShapeGeometry(shape);
const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  wireframe: false,
  side: THREE.DoubleSide,
});
const coin = new THREE.Mesh(geometry, material);

//const coin = new THREE.Mesh(coinGeometry, coinMaterial);
coin.rotation.x = 0;
coin.rotation.y = 0;
coin.rotation.z = 0;
scene.add(coin);

const rotationAngle = Math.PI / 8;

/*
 * Animation Variables
 */
let isAnimating = false;
let animationTime = 0;
const animationDuration = 1000; // Duration of the animation in milliseconds
const duration = 0.2;
/*
 * Raycaster for Mouse Interaction
 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let rotationAxis = new THREE.Vector3();
let x = 0;
let y = 0;

function onMouseClick(event, x, y) {
  // Convert mouse position to normalized device coordinates (NDC)
  console.log('click');
  mouse.x = x || (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = y || -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  console.log(mouse.x, mouse.y);
  // Check for intersections with the coin
  const intersects = raycaster.intersectObjects([coin]);
  console.log('inter', intersects);
  if (intersects.length > 0) {
    isAnimating = true;
    animationTime = 0;
    coin.rotation.set(Math.PI / 2, 0, 0); // Reset rotation before starting new animation
    rotationAxis.set(-mouse.y, 0, -mouse.x).normalize();
  }
}

function onMouseUp(event) {
  // Convert mouse position to normalized device coordinates (NDC)

  if (isAnimating) return;
  mouse.x = -0.06517902855734226;
  mouse.y = -(-0.2987556832735656);

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  console.log(mouse.x, mouse.y);
  // Check for intersections with the coin
  rotationAxis.set(-mouse.y, 0, -mouse.x).normalize();

  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(targetQuaternion.w);

  gsap.to(coin.quaternion, {
    x: Math.PI / 2,
    y: 0,
    z: 0,
    w: Math.PI / 2,
    duration: duration,
    onUpdate: () => {
      coin.quaternion.normalize();
    },
  });
}
function onMouseDown(event) {
  // Convert mouse position to normalized device coordinates (NDC)
  if (isAnimating) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  console.log(mouse.x, mouse.y);
  // Check for intersections with the coin
  rotationAxis.set(-mouse.y, 0, -mouse.x).normalize();
  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(
    coin.quaternion.x,
    coin.quaternion.y,
    coin.quaternion.y,
    coin.quaternion.w
  );
  gsap.to(coin.quaternion, {
    x: targetQuaternion.x,
    y: targetQuaternion.y,
    z: targetQuaternion.z,
    w: targetQuaternion.w,
    duration: duration,
    onUpdate: () => {
      coin.quaternion.normalize();
    },
  });

  const rand = Math.random();
  if (rand < 0.3) onMouseClick(event);
}

function onTouchStart(event) {
  event.preventDefault();
  if (event.touches) {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  } else {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  raycaster.setFromCamera(mouse, camera);

  rotationAxis.set(-mouse.y, 0, -mouse.x).normalize();
  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(
    coin.quaternion.x,
    coin.quaternion.y,
    coin.quaternion.y,
    coin.quaternion.w
  );
  gsap.to(coin.quaternion, {
    x: targetQuaternion.x,
    y: targetQuaternion.y,
    z: targetQuaternion.z,
    w: targetQuaternion.w,
    duration: duration,
    onUpdate: () => {
      coin.quaternion.normalize();
    },
  });
  const rand = Math.random();
  if (rand < 0.4) onMouseClick(event, mouse.x, mouse.y);
}

function onTouchEnd(event) {
  event.preventDefault();
  console.log('touchend', event, event.touches);
  if (event.touches.length) {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  } else {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  raycaster.setFromCamera(mouse, camera);

  rotationAxis.set(-mouse.y, 0, -mouse.x).normalize();
  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(targetQuaternion.w);

  gsap.to(coin.quaternion, {
    x: Math.PI / 2,
    y: 0,
    z: 0,
    w: Math.PI / 2,
    duration: duration,
    onUpdate: () => {
      coin.quaternion.normalize();
    },
  });
}

//renderer.domElement.addEventListener('click', onMouseClick);
renderer.domElement.addEventListener('mousedown', onMouseDown);
renderer.domElement.addEventListener('mouseup', onMouseUp);
renderer.domElement.addEventListener('touchstart', onTouchStart);
renderer.domElement.addEventListener('touchend', onTouchEnd);

/*
 * Animation Logic
 */
// function animate() {
//   requestAnimationFrame(animate);
//   //const axis = new THREE.Vector3(0, 1, 0);
//   if (true) {
//     const delta = Math.min(animationTime / animationDuration, 1); // Normalize delta
//     //console.log('delta', delta);
//     const dAngle = (2 * Math.PI) / (animationDuration / 16.67);
//     //const angle = Math.PI * 2 * delta;
//     //console.log(angle);
//     //coin.rotation.y = Math.PI * 2 * delta; // Rotate the coin multiple times
//     console.log('rotate', delta);
//     coin.rotateOnAxis(rotationAxis, dAngle);
//     //coin.rotation.y = Math.PI * 2 * delta;
//     //coin.rotation.x = Math.PI / 2 + Math.PI * 2 * delta; // Flip the coin

//     if (animationTime >= animationDuration) {
//       isAnimating = false;
//       coin.rotation.set(0, 0, 0); // Reset to start position
//     }

//     animationTime += 16.67; // Increment time by approx. one frame duration
//   }

//   renderer.render(scene, camera);
// }

// animate();

renderer.render(scene, camera);
