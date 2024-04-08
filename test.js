import './style.css';
import * as THREE from 'three';

export function getImageData(imagePath) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 600;
      const context = canvas.getContext('2d');
      console.log(canvas.width, canvas.height, image.width);
      context.drawImage(image, 0, 0);
      const imageData = context.getImageData(0, 0, 600, 600);
      resolve(imageData);
    };
    image.onerror = (e) => {
      reject(new Error(`Failed to load image at ${imagePath}`));
    };
    image.src = imagePath;
  });
}

function sortAndRemoveOutliers(points, outlierThreshold = 1) {
  // Sort points to form a continuous path
  const sortedPoints = [];
  let currentPoint = points.pop(); // Start with the last point in the array
  sortedPoints.push(currentPoint);

  while (points.length > 0) {
    let nearestIndex = -1;
    let minDistance = Infinity;

    // Find the nearest unvisited point
    for (let i = 0; i < points.length; i++) {
      const distance = currentPoint.distanceTo(points[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }

    // Check if the nearest point is too far (outlier detection)
    if (minDistance > outlierThreshold) {
      points.splice(nearestIndex, 1); // Remove the outlier point
      continue; // Skip adding this point to the path
    }

    currentPoint = points.splice(nearestIndex, 1)[0]; // Move to the nearest point
    sortedPoints.push(currentPoint);
  }

  return sortedPoints;
}

function removeEveryNthElementInPlace(arr, n) {
  for (let i = n - 1; i < arr.length; i += n - 1) {
    arr.splice(i, 1);
  }
  return arr;
}

function extractOutlinePoints(imageData, threshold = 0) {
  const points = [];
  const spacing = 1;
  const isEdgePixel = (x, y, width, data) => {
    const alpha = data[(x + y * width) * 4 + 3];
    return alpha > threshold;
  };
  //console.log(imageData.data);
  // Scan for edge pixels
  for (let y = 0; y < imageData.height; y += spacing) {
    for (let x = 0; x < imageData.width; x += spacing) {
      const index = (x + y * imageData.width) * 4;

      const alpha = imageData.data[index + 3];
      if (alpha > threshold) {
        // Check surrounding pixels
        if (
          !isEdgePixel(x - 1, y, imageData.width, imageData.data) ||
          !isEdgePixel(x + 1, y, imageData.width, imageData.data) ||
          !isEdgePixel(x, y - 1, imageData.width, imageData.data) ||
          !isEdgePixel(x, y + 1, imageData.width, imageData.data)
        ) {
          points.push(new THREE.Vector2(x, y));
        }
      }
    }
  }
  const res = sortAndRemoveOutliers(points, 10);
  return removeEveryNthElementInPlace(
    removeEveryNthElementInPlace(
      removeEveryNthElementInPlace(
        removeEveryNthElementInPlace(removeEveryNthElementInPlace(res, 2), 2),
        2
      ),
      2
    ),
    2
  );
}

export function createExtrudeShape(imageData) {
  const outlinePoints = extractOutlinePoints(imageData);
  console.log('length', outlinePoints.length);
  const shape = new THREE.Shape();

  // Assume outlinePoints are sorted and form a closed loop
  outlinePoints.forEach((point, index) => {
    const x = (point.x - imageData.width / 2) / 50; // Centering X
    const y = (-point.y + imageData.height / 2) / 50; // Centering Y, Y is inverted in canvas
    if (index === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  });

  // Close the shape
  shape.lineTo(
    (outlinePoints[0].x - imageData.width / 2) / 50,
    (-outlinePoints[0].y + imageData.height / 2) / 50
  );

  return shape;
}

export function createPointsFromImageData(imageData) {
  const points3d = [];
  const spacing = 1;
  console.log('cpid', imageData.height);
  for (let y = 0; y < imageData.height; y += spacing) {
    for (let x = 0; x < imageData.width; x += spacing) {
      const index = (x + y * imageData.width) * 4;
      const alpha = imageData.data[index + 3];
      if (alpha > 0) {
        // Non-transparent pixel
        // Adjust position by subtracting half the width/height to center the mesh
        points3d.push(
          new THREE.Vector3(
            (x - imageData.width / 2) / 50,
            0,
            (y - imageData.height / 2) / 50
          )
        );
      }
    }
  }
  const zp = points3d.map((p) => ({ ...p, y: p.y + 2 }));
  return [...points3d, ...zp];
}

export async function createMesh(imagePath) {
  const imageData = await getImageData(imagePath);
  const points3d = createPointsFromImageData(imageData);
  console.log(points3d.length);
  const geometry = new THREE.BufferGeometry().setFromPoints(points3d);
  console.log('Number of vertices:', points3d.length);
  console.log('Buffer is:', geometry.attributes.position.array.length);
  const textureLoader = new THREE.TextureLoader();
  const coinTexture = textureLoader.load('./p.png');
  const mesh = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      map: coinTexture,
      alphaTest: 0.5,
    })
  );
  scene.add(mesh);
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

createMesh('./a.png');

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
