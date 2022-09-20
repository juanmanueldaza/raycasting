import "./style.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

const options = {
  sphereColor: "#ffea00",
  raycastColor: "#ffaa00",
  sphereWireframe: false,
  sphereSpeed: 0.01,
  spotLightAngle: 0.2,
  spotLightPenumbra: 0,
  spotLightIntensity: 1,
};

const create = {
  renderer: () => {
    const renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    return renderer;
  },
  scene: () => {
    const scene = new THREE.Scene();
    scene.add(helpers.axes);
    scene.add(helpers.grid);
    scene.add(helpers.spotLight);
    scene.add(box);
    scene.add(plane);
    scene.add(sphere);
    scene.add(lights.ambient);
    scene.add(lights.spot);

    return scene;
  },
  camera: () => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(1, 2, 6); // same as above but in one line (x, y, z)
    // Every time you set the position of the camera, you need to update the orbit controls
    controls.update();
    return camera;
  },
  control: () => {
    return new OrbitControls(camera, renderer.domElement);
  },
  gui: () => {
    new dat.GUI();
  },
  raycaster: () => {
    return new THREE.Raycaster();
  },
  pointer: {
    click: () => {
      new THREE.Vector2();
    },
    move: () => {
      new THREE.Vector2();
    },
  },
  object: {
    box: () => {
      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const box = new THREE.Mesh(geometry, material);
      return box;
    },
    plane: () => {
      const geometry = new THREE.PlaneGeometry(30, 30);
      const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(geometry, material);
      plane.rotation.x = -0.5 * Math.PI;
      plane.receiveShadow = true;
      plane.name = "plane-1";
      plane.userData.draggable = true;
      plane.userData.ground = true;
      return plane;
    },
    sphere: () => {
      const geometry = new THREE.SphereGeometry(5, 40, 50);
      const material = new THREE.MeshStandardMaterial({
        color: options.sphereColor,
        wireframe: options.sphereWireframe,
      });
      const sphere = new THREE.Mesh(geometry, material);
      return sphere;
    },
  },
  light: {
    ambient: () => {
      return new THREE.AmbientLight(0x333333);
    },
    spot: () => {
      return new THREE.SpotLight(0xffffff);
    },
  },
  helper: {
    axes: () => {
      return new THREE.AxesHelper(5);
    },
    spotLight: () => {
      return new THREE.SpotLightHelper(lights.spot);
    },
    grid: () => {
      const gridHelper = new THREE.GridHelper(30);
      return gridHelper;
    },
  },
};
let draggable = null;

const renderer = create.renderer();
const scene = create.scene();
const camera = create.camera();
const controls = create.control();
const box = create.object.box();
const plane = create.object.plane();
const sphere = create.object.sphere();
const lights = {
  ambient: create.light.ambient(),
  spot: create.light.spot(),
};
const helpers = {
  axes: create.helper.axes(),
  spotLight: create.helper.spotLight(),
  grid: create.helper.grid(),
};
const gui = create.gui();
const raycaster = raycasting.createRaycaster();
const pointerClick = raycasting.pointer.click();
const pointerMove = raycasting.pointer.move();

///////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING A BOX ///////////////////////////

///////////////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING A SPHERE ///////////////////////////

///////////////////////////////////////////////////////////////////////

/////////////////////////// CREATING LIGHTS ///////////////////////////

lights.spot.position.set(-100, 100, 0);
lights.spot.castShadow = true;
lights.spot.angle = 0.2;

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
  if (raycasting.draggable != null) {
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
  lights.spot.angle = options.spotLightAngle;
  lights.spot.penumbra = options.spotLightPenumbra;
  lights.spot.intensity = options.spotLightIntensity;
  helpers.spotLight.update();
  renderer.render(scene, camera);
}

window.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
