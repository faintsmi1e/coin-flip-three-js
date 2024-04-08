import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { adjustUVsForCaps, createExtrudeShape, getImageData } from './test';

/*
 * Setup
 */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffe8dc);
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.5,
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
const imagePath = './b.png'
const coinTexture = textureLoader.load(imagePath); // Ensure you have an image at this path
coinTexture.repeat.set(0.09, 0.09);
coinTexture.offset.set(0.5, 0.5);
const imageData = await getImageData(imagePath);

const shape = createExtrudeShape(imageData);

const extrudeSettings = {
  steps: 1,
  depth: 0.2, // Small depth for a flat appearance
  bevelEnabled: false, // No bevel for a sharp-edged look
};

const shapeGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

adjustUVsForCaps(shapeGeometry, coinTexture);
const coinMaterial = new THREE.MeshBasicMaterial({
  map: coinTexture,
  transparent: true,
  side: THREE.DoubleSide,
});
const coinGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 20, 20, false);
const coin = new THREE.Mesh(shapeGeometry, coinMaterial);

const basePosition = {
  x: 0,
  y: 0,
  z: 0,
  w: Math.PI,
};
coin.rotation.x = basePosition.x;
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

function setRotationAxis(x, y, z) {
  rotationAxis.set(-y, x, 0).normalize();
}

function onMouseClick(event) {
  // Convert mouse position to normalized device coordinates (NDC)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  console.log(mouse.x, mouse.y);
  // Check for intersections with the coin
  const intersects = raycaster.intersectObjects([coin]);
  console.log('inter', intersects);
  if (intersects.length > 0) {
    isAnimating = true;
    animationTime = 0;
    coin.rotation.set(0, 0, 0); // Reset rotation before starting new animation
    setRotationAxis(mouse.x, mouse.y, mouse.z);
  }
}

function onMouseUp(event) {
  // Convert mouse position to normalized device coordinates (NDC)

  if (isAnimating) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  console.log(mouse.x, mouse.y);
  // Check for intersections with the coin
  setRotationAxis(mouse.x, mouse.y, mouse.z);

  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(targetQuaternion.w);

  gsap.to(coin.quaternion, {
    ...basePosition,
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
  setRotationAxis(mouse.x, mouse.y, mouse.z);
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
  if (rand < 0.1) onMouseClick(event);
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

  setRotationAxis(mouse.x, mouse.y, mouse.z);
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
  if (rand < 0.01) onMouseClick(event);
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

  setRotationAxis(mouse.x, mouse.y, mouse.z);
  const targetQuaternion = coin.quaternion
    .clone()
    .multiply(
      new THREE.Quaternion().setFromAxisAngle(rotationAxis, rotationAngle)
    );
  console.log(targetQuaternion.w);

  gsap.to(coin.quaternion, {
    ...basePosition,
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
function animate() {
  requestAnimationFrame(animate);
  //const axis = new THREE.Vector3(0, 1, 0);
  if (isAnimating) {
    const delta = Math.min(animationTime / animationDuration, 1); // Normalize delta
    //console.log('delta', delta);
    const dAngle = (2 * Math.PI) / (animationDuration / 16.67);
    //const angle = Math.PI * 2 * delta;
    //console.log(angle);
    //coin.rotation.y = Math.PI * 2 * delta; // Rotate the coin multiple times
    console.log('rotate', delta);
    coin.rotateOnAxis(rotationAxis, dAngle);
    //coin.rotation.y = Math.PI * 2 * delta;
    //coin.rotation.x = Math.PI / 2 + Math.PI * 2 * delta; // Flip the coin

    if (animationTime >= animationDuration) {
      isAnimating = false;
      coin.rotation.set(basePosition.x, 0, 0); // Reset to start position
    }

    animationTime += 16.67; // Increment time by approx. one frame duration
  }

  renderer.render(scene, camera);
}

animate();
