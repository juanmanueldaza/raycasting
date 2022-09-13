import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbit = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);

scene.add(axesHelper);

/////////////////////////// CAMERA POSITION ///////////////////////////
// camera.position.x = 1;
// camera.position.y = 1;
// camera.position.z = 10;
camera.position.set(1, 2, 6); // same as above but in one line (x, y, z)
// Every time you set the position of the camera, you need to update the orbit controls
orbit.update();
///////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING A BOX ///////////////////////////
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const box = new THREE.Mesh(boxGeometry, boxMaterial);

scene.add(box);
///////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING A RAYCASTER ///////////////////////////

/////////////////////////// CREATING A PLANE SURFACE ///////////////////////////

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffff00,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;
plane.name = "plane-1";
plane.userData.draggable = true;
plane.userData.ground = true;

const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);

///////////////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING A SPHERE ///////////////////////////
const sphereGeometry = new THREE.SphereGeometry(5, 40, 50);
const sphereMaterial = new THREE.MeshStandardMaterial({
  color: 0x000000,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);
sphere.position.set(-10, 10, 0);
sphere.castShadow = true;
sphere.name = "sphere";
///////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING LIGHTS ///////////////////////////
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
// scene.add(directionalLight);
// directionalLight.position.set(-30, 50, 0);
// directionalLight.castShadow = true;
// directionalLight.shadow.camera.bottom = -12;

// const dLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
// scene.add(dLightHelper);

// const dLightShadowHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// );
// scene.add(dLightShadowHelper);

const spotLight = new THREE.SpotLight(0xffffff);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.2;

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

const gui = new dat.GUI();
const options = {
  sphereColor: "#ffea00",
  raycastColor: "#ffaa00",
  sphereWireframe: false,
  sphereSpeed: 0.01,
  spotLightAngle: 0.2,
  spotLightPenumbra: 0,
  spotLightIntensity: 1,
};

gui.addColor(options, "sphereColor").onChange((e) => {
  sphere.material.color.set(e);
});
gui.add(options, "sphereWireframe").onChange((e) => {
  sphere.material.wireframe = e;
});
gui.add(options, "sphereSpeed", 0, 4);
gui.add(options, "spotLightAngle", 0, 1);
gui.add(options, "spotLightPenumbra", 0, 1);
gui.add(options, "spotLightIntensity", 0, 2);

let step = 0;
let speed = 0.01;

const raycaster = new THREE.Raycaster();
const pointerClick = new THREE.Vector2();
const pointerMove = new THREE.Vector2();
let draggable;

function onPointerDown(event) {
  if (draggable) {
    console.log(`dropped draggable object: ${draggable.name}`);
    draggable = null;
    return;
  }
  pointerClick.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerClick.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // update the picking ray with the camera and pointer position
  raycaster.setFromCamera(pointerClick, camera);
  // calculate objects intersecting the picking ray
  const found = raycaster.intersectObjects(scene.children);

  if (found.length > 0 && found[0].object.userData.draggable) {
    draggable = found[0].object;
    console.log(`found draggable object: ${draggable.name}`);
  }
}

function onPointerMove(event) {
  pointerMove.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerMove.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function dragObject() {
  if (draggable != null) {
    raycaster.setFromCamera(pointerMove, camera);
    const found = raycaster.intersectObject(scene.children);
    if (found.length > 0) {
      for (let o of found) {
        console.log(o.object.name);
      }
    }
  }
}

function animate(time) {
  dragObject();
  box.rotation.x = time / 1000;
  box.rotation.y = time / 1000;
  step += options.sphereSpeed;
  sphere.position.y = 10 * Math.abs(Math.sin(step));
  spotLight.angle = options.spotLightAngle;
  spotLight.penumbra = options.spotLightPenumbra;
  spotLight.intensity = options.spotLightIntensity;
  spotLightHelper.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
window.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
