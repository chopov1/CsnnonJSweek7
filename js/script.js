//use ctrl c to stop the program running and gain control of the console
//ThreeJS is a Y-up platform
//use f12 on website to debug
//use "npm init -y" to create package.json
//use "npm i parcel" to create node-modules
//use "npm install three" to install threejs library
//to run type "parcel ./src/index.html"

import * as THREE from "three"
import { AmbientLight, BoxGeometry, DoubleSide, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, ShaderMaterial, SphereGeometry, TextureLoader } from "three";
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import * as CANNON from "cannon-es";
import {Vec3, vec3} from "cannon-es";
import sunpic from '../img/sunpic.png';


//got pic for box here
//https://www.pinclipart.com/picdir/big/155-1550479_vapor-grunge-palmtree-vaporwave-vaporwaveaesthetic-vaporwave-png-clipart.png

//#region setup
var height = window.innerHeight;
var width = window.innerWidth;

const textureLoader = new TextureLoader();
const suntexture = textureLoader.load(sunpic);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width,height);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width/height, 0.1,1000);
camera.position.set(120,160,300);

const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();
scene.add(camera);

const uniforms = {

    time: { value: 1.0 },
    resolution: { value: new THREE.Vector2(width, height).multiplyScalar(window.devicePixelRatio) }

}

const shaderMaterial1 = new THREE.ShaderMaterial( {

	uniforms,

	vertexShader: document.getElementById( 'vertexShader1' ).textContent,

	fragmentShader: document.getElementById( 'fragmentShader1' ).textContent

} );

const shaderMaterial2 = new THREE.ShaderMaterial( {

	uniforms,

	vertexShader: document.getElementById( 'vertexShader2' ).textContent,

	fragmentShader: document.getElementById( 'fragmentShader2' ).textContent

} );

const world = new CANNON.World({
    gravity: new CANNON.Vec3(0,-10,0)
});

const light = new AmbientLight();
scene.add(light);

const groundPhyMat = new CANNON.Material();
const boxPhyMat = new CANNON.Material();
const groundBoxContactMat = new CANNON.ContactMaterial(groundPhyMat,boxPhyMat, {friction: .1} );


const groundGeo = new PlaneGeometry(40,40);
const groundMat = new ShaderMaterial({side: DoubleSide, color: 0x00ffaa});
const ground = new Mesh(groundGeo, shaderMaterial1);
const level1 = new Mesh(groundGeo, shaderMaterial2);
const level2 = new Mesh(groundGeo, shaderMaterial1);
const level3 = new Mesh(groundGeo, shaderMaterial2);

//#region grounds
const groundBoxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(20,20,1)),
    type: CANNON.Body.STATIC,
    material: groundPhyMat,
    position: new Vec3(0,0,20)
});
groundBoxBody.quaternion.setFromEuler(-Math.PI / 2,0,0);

const level1Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(20,20,1)),
    type: CANNON.Body.STATIC,
    material: groundPhyMat,
    position: new Vec3(0, 30, -36)
});
level1Body.quaternion.setFromEuler(-Math.PI / 2.1,0,0);

const level2Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(20,20,1)),
    type: CANNON.Body.STATIC,
    material: groundPhyMat,
    position: new Vec3(0, 60, -80)
});
level2Body.quaternion.setFromEuler(-Math.PI / 2.1,0,0);

const level3Body = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(20,20,1)),
    type: CANNON.Body.STATIC,
    material: groundPhyMat,
    position: new Vec3(0, 90, -120)
});
level3Body.quaternion.setFromEuler(-Math.PI / 2.1,0,0);

world.addBody(groundBoxBody)
world.addBody(level1Body);
world.addBody(level2Body);
world.addBody(level3Body);
scene.add(ground);
scene.add(level1);
scene.add(level2);
scene.add(level3);
//#endregion

//const groundBody = new CANNON.Body({shape:new CANNON.Plane(), type: CANNON.Body.STATIC});

//world.addBody(groundBody);

//#endregion

world.addContactMaterial(groundBoxContactMat);

const spherePhyMat = new CANNON.Material();
const groundSphereCOntactMat = new CANNON.ContactMaterial(groundPhyMat, spherePhyMat, {restitution: .5});
world.addContactMaterial(groundSphereCOntactMat);

const boxGeo = new BoxGeometry(10, 10, 10);
const boxMat = new MeshBasicMaterial({color: 0xff00bb, map: suntexture});
const box = new Mesh(boxGeo, boxMat);

const boxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(5,5,5)),
    mass:.05,
    position: new CANNON.Vec3(0, 20, 35),
    material: boxPhyMat
});


boxBody.angularVelocity.set(0,10,0);
boxBody.angularDamping = 0.8;



const sphereGeo = new SphereGeometry(4);
const sphereMat = new MeshBasicMaterial({color: 0xaabbaa, wireframe: true});
const sphere = new Mesh(sphereGeo, sphereMat);
scene.add(sphere);
const sphereBody = new CANNON.Body({
    shape: new CANNON.Sphere(2),
    mass:1,
    position: new CANNON.Vec3(0, 120, -120),
    material: spherePhyMat
})
world.addBody(sphereBody);
world.addBody(boxBody);
scene.add(box);

var timestep = 1/60;

const clock = new THREE.Clock();


function animate(time){

    world.step(timestep);
    uniforms.time.value = clock.getElapsedTime();

    ground.position.copy(groundBoxBody.position);
    ground.quaternion.copy(groundBoxBody.quaternion);
    level1.position.copy(level1Body.position);
    level1.quaternion.copy(level1Body.quaternion);
    level2.position.copy(level2Body.position);
    level2.quaternion.copy(level2Body.quaternion);
    level3.position.copy(level3Body.position);
    level3.quaternion.copy(level3Body.quaternion);

    box.position.copy(boxBody.position);
    box.quaternion.copy(boxBody.quaternion);

    sphere.position.copy(sphereBody.position);
    sphere.quaternion.copy(sphereBody.quaternion);

    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);