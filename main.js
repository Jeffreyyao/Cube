import * as THREE from 'three'
import { Color } from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { RoundEdgedBox } from './RoundEdgedBox'

// setup scene, camera & renderer
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 6
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// set up lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.005)
scene.add(ambientLight)
const light1 = new THREE.SpotLight(0xffffff, 0.015)
light1.position.set(3, 0, 0)
scene.add(light1)
const light2 = new THREE.SpotLight(0xffffff, 0.015)
light2.position.set(-3, 0, 0)
scene.add(light2)
const light3 = new THREE.SpotLight(0xffffff, 0.015)
light3.position.set(0, 3, 0)
scene.add(light3)
const light4 = new THREE.SpotLight(0xffffff, 0.015)
light4.position.set(0, -3, 0)
scene.add(light4)
const light5 = new THREE.SpotLight(0xffffff, 0.015)
light5.position.set(0, 0, 3)
scene.add(light5)
const light6 = new THREE.SpotLight(0xffffff, 0.015)
light6.position.set(0, 0, -3)
scene.add(light6)

const black = [0, 0, 0]
const gray = [30, 30, 30]
const white = [255, 255, 255]
const yellow = [0xff, 0xea, 0x00]
const blue = [0x29, 0x79, 0xff]
const green = [0x76, 0xff, 0x03]
const red = [0xb7, 0x1c, 0x1c]
const orange = [0xff, 0x3d, 0x00]

const gap = 0.1
const cube_size = 0.95

// URFDLB
function generate_block_mesh(center, colors) {
	const block = new THREE.Object3D()

	const center_cube = new THREE.Mesh(
		RoundEdgedBox(cube_size, cube_size, cube_size),
		new THREE.MeshStandardMaterial({
			color: new Color(...gray)
		})
	)
	center_cube.position.set(0, 0, 0)
	block.add(center_cube)
	
	for (var i in center) {
		if (center[i] === 0) { continue }
		const side = new THREE.Mesh(
			RoundEdgedBox(cube_size-gap, cube_size-gap, gap),
			new THREE.MeshStandardMaterial({
				color: new Color(...colors[i])
			})
		)
		const pos = center.map((ele, idx) => idx === +i ? ele/2 : 0)
		if (pos[0] !== 0) {
			side.rotateY(Math.PI/2)
		}
		if (pos[1] !== 0) {
			side.rotateX(Math.PI/2)
		}
		side.position.set(...pos)
		block.add(side)
	}
	block.position.set(...center)
	return block
}

var Cube = [
	// layer 1
	{ center: [-1, 1, -1], colors: [blue, red, yellow] },
	{ center: [0, 1, -1], colors: [black, red, yellow] },
	{ center: [1, 1, -1], colors: [green, red, yellow] },
	{ center: [-1, 1, 0], colors: [blue, red, black] },
	{ center: [0, 1, 0], colors: [black, red, black] },
	{ center: [1, 1, 0], colors: [green, red, black] },
	{ center: [-1, 1, 1], colors: [blue, red, white] },
	{ center: [0, 1, 1], colors: [black, red, white] },
	{ center: [1, 1, 1], colors: [green, red, white] },
	// layer 2
	{ center: [-1, 0, -1], colors: [blue, black, yellow] }, // 9
	{ center: [0, 0, -1], colors: [black, black, yellow] },
	{ center: [1, 0, -1], colors: [green, black, yellow] },
	{ center: [-1, 0, 0], colors: [blue, black, black] },
	{ center: [0, 0, 0], colors: [black, black, black] },
	{ center: [1, 0, 0], colors: [green, black, black] },
	{ center: [-1, 0, 1], colors: [blue, black, white] },
	{ center: [0, 0, 1], colors: [black, black, white] },
	{ center: [1, 0, 1], colors: [green, black, white] },
	// layer 3
	{ center: [-1, -1, -1], colors: [blue, orange, yellow] }, // 18
	{ center: [0, -1, -1], colors: [black, orange, yellow] },
	{ center: [1, -1, -1], colors: [green, orange, yellow] },
	{ center: [-1, -1, 0], colors: [blue, orange, black] },
	{ center: [0, -1, 0], colors: [black, orange, black] },
	{ center: [1, -1, 0], colors: [green, orange, black] },
	{ center: [-1, -1, 1], colors: [blue, orange, white] },
	{ center: [0, -1, 1], colors: [black, orange, white] },
	{ center: [1, -1, 1], colors: [green, orange, white] },
]

const CubeMesh = new THREE.Object3D()
for (var block of Cube) {
	const block_mesh = generate_block_mesh(block.center, block.colors)
	block.mesh = block_mesh
	CubeMesh.attach(block_mesh)
}
scene.add(CubeMesh)

const face_group = new THREE.Group()
scene.add(face_group)

const face_indices = {
	red: [0, 1, 2, 3, 4, 5, 6, 7, 8],
	white: [6, 7, 8, 15, 16, 17, 24, 25, 26],
	blue: [0, 3, 6, 9, 12, 15, 18, 21, 24],
	orange: [24, 25, 26, 21, 22, 23, 18, 19, 20],
	yellow: [2, 1, 0, 11, 10, 9, 20, 19, 18],
	green: [8, 5, 2, 17, 14, 11, 26, 23, 20],
}

function populate_face_group(face) {
	for (var idx of face_indices[face]) {
		face_group.attach(Cube[idx].mesh)
	}
}

function clear_face_group() {
	while (face_group.children.length !== 0) {
		CubeMesh.attach(face_group.children[0])
	}
	face_group.rotation.set(0, 0, 0)
}

const cw_reorder_idx = [2, 5, 8, 1, 4, 7, 0, 3, 6]
const ccw_reorder_idx = [6, 3, 0, 7, 4, 1, 8, 5, 2]

function reorder(face, ccw=false) {
	var buffer = []
	const reorder_idx = ccw ? ccw_reorder_idx : cw_reorder_idx
	const face_idx = face_indices[face]
	for (var idx of face_idx) {
		buffer.push(Cube[idx])
		Cube[idx] = null
	}
	for (var idx in buffer) {
		Cube[face_idx[reorder_idx[idx]]] = buffer[idx]
	}
}

const controls = new OrbitControls(camera, renderer.domElement)
controls.enablePan = false

var rotation_lock = false
var rotation_angle = 0 // degrees
var rotation_axis = new THREE.Vector3(0, 0, 1)
const rotation_increment = 10 // degrees

var rotate_history = []
var rotate_queue = []

const face_to_action_map = {
	'red': 'U',
	'white': 'F',
	'blue': 'L',
	'orange': 'D',
	'yellow': 'B',
	'green': 'R',
}

const action_to_face_map = {
	'U': 'red',
	'F': 'white',
	'L': 'blue',
	'D': 'orange',
	'B': 'yellow',
	'R': 'green',
}

function rotate_enqueue(face, ccw=false) {
	rotate_history.push(ccw ? face_to_action_map[face] + '\'' : face_to_action_map[face])
	console.log(rotate_history)
	rotate_queue.push([face, ccw])
}

function rotate(face, ccw=false) {
	if (rotation_lock) { return }

	const angle = ccw ? 90 : -90

	clear_face_group()
	populate_face_group(face)

	switch (face) {
		case 'red':
			rotation_axis = new THREE.Vector3(0, 1, 0)
			break
		case 'white':
			rotation_axis = new THREE.Vector3(0, 0, 1)
			break
		case 'blue':
			rotation_axis = new THREE.Vector3(-1, 0, 0)
			break
		case 'orange':
			rotation_axis = new THREE.Vector3(0, -1, 0)
			break
		case 'yellow':
			rotation_axis = new THREE.Vector3(0, 0, -1)
			break
		case 'green':
			rotation_axis = new THREE.Vector3(1, 0, 0)
			break
	}

	reorder(face, ccw)
	rotation_angle = angle
	rotation_lock = true
}

function animate() {
	if (rotation_angle === 0) {
		rotation_lock = false
		if (rotate_queue.length !== 0 && !rotation_lock) {
			rotate(...rotate_queue.shift())
		}
	} else {
		var angle_to_rotate = rotation_increment
		if (Math.abs(rotation_angle) < rotation_increment) {
			angle_to_rotate = rotation_angle
		}
		if (rotation_angle < 0) {
			angle_to_rotate *= -1
		}
		rotation_angle -= angle_to_rotate
		face_group.rotateOnAxis(rotation_axis, THREE.MathUtils.degToRad(angle_to_rotate))
	}
	requestAnimationFrame(animate)
	renderer.render(scene, camera)
}

for (var idx in Object.keys(face_indices)) {
	const face = Object.keys(face_indices)[idx]
	document.getElementById(face).onclick = (e) => {
		rotate_enqueue(face)
	}
	document.getElementById(face + 'p').onclick = (e) => {
		rotate_enqueue(face, true)
	}
}

document.onkeydown = (e) => {
	// Ignore keyboard events if the move input is focused
	if (document.getElementById('move-input') === document.activeElement) {
		return
	}
	
	console.log(e.code)
	if (Object.keys(action_to_face_map).includes(e.code.replace('Key', ''))) {
		const face = action_to_face_map[e.code.replace('Key', '')]
		rotate_enqueue(face, e.shiftKey)
	}
}

animate()

const solver_url = 'https://just-martin-striking.ngrok-free.app'
const solver_path = '/solve'

document.getElementById('solve').onclick = async () => {
	if (rotate_history.length === 0) {
		return
	}
	const solveButton = document.getElementById('solve')
	solveButton.classList.add('loading')
	
	const query = rotate_history.join(' ')
	const url = `${solver_url}${solver_path}?query=${encodeURIComponent(query)}`
	console.log(url)
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: new Headers({
				'ngrok-skip-browser-warning': '123456'
			})
		})
		const solution = await response.text()
		document.getElementById('solution').textContent = solution
		document.getElementById('move-input').value = solution
	} catch (error) {
		document.getElementById('solution').textContent = 'Error: Could not get solution'
		console.error('Error fetching solution:', error)
	} finally {
		solveButton.classList.remove('loading')
	}
}

document.getElementById('run-moves').onclick = () => {
	const input = document.getElementById('move-input').value.trim()
	if (!input) return

	const moves = input.split(/\s+/)
	for (const move of moves) {
		// Handle moves like "R2", "U'", etc.
		const baseMove = move[0]
		const modifier = move.slice(1)
		
		if (Object.keys(action_to_face_map).includes(baseMove)) {
			const face = action_to_face_map[baseMove]
			const ccw = modifier === "'"
			const count = modifier === "2" ? 2 : 1
			
			for (let i = 0; i < count; i++) {
				rotate_enqueue(face, ccw)
			}
		}
	}
	
	// Clear the input after processing
	document.getElementById('move-input').value = ''
}