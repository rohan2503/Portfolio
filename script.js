let scene, camera, renderer, spheres = [];
let raycaster, mouse;
let hoveredSphere = null;
let clock = new THREE.Clock();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Create spheres
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xD1D8E0,  // Light gray color
        metalness: 0.5,
        roughness: 0.7
    });
    
    const numSpheres = 20;  // Reduced number of spheres to prevent overcrowding
    const minDistance = 0.05; // Minimum distance between sphere centers
    
    for (let i = 0; i < numSpheres; i++) {
        const size = Math.random() * 0.2 + 0.6; // Adjusted size range
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const sphere = new THREE.Mesh(geometry, material);
        
        let position;
        let attempts = 0;
        do {
            position = getRandomPosition(2.5); // Increased radius for more spread
            attempts++;
        } while (isTooClose(position, size, minDistance) && attempts < 100);

        if (attempts < 100) {
            sphere.position.copy(position);
            sphere.userData = { 
                originalPosition: sphere.position.clone(), 
                bounceOffset: Math.random() * Math.PI * 2,
                bounceSpeed: 0.5 + Math.random() * 0.5
            };
            scene.add(sphere);
            spheres.push(sphere);
        }
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 6;
    camera.position.y = -0.5;

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
}

function getRandomPosition(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * Math.cbrt(Math.random());
    return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
    );
}

function isTooClose(position, size, minDistance) {
    for (let sphere of spheres) {
        const distance = position.distanceTo(sphere.position);
        if (distance < (size + sphere.geometry.parameters.radius + minDistance)) {
            return true;
        }
    }
    return false;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    spheres.forEach(sphere => {
        if (sphere === hoveredSphere) {
            animateHoveredSphere(sphere);
        } else {
            animateIdleSphere(sphere, time);
        }
    });

    if (intersects.length > 0) {
        if (hoveredSphere !== intersects[0].object) {
            hoveredSphere = intersects[0].object;
        }
    } else {
        hoveredSphere = null;
    }

    renderer.render(scene, camera);
}

function animateHoveredSphere(sphere) {
    sphere.userData.bounceOffset += 0.1;
    const bounceHeight = Math.sin(sphere.userData.bounceOffset) * 0.1;
    sphere.position.y = sphere.userData.originalPosition.y + bounceHeight;
}

function animateIdleSphere(sphere, time) {
    const bounceHeight = Math.sin(time * sphere.userData.bounceSpeed + sphere.userData.bounceOffset) * 0.05;
    sphere.position.y = sphere.userData.originalPosition.y + bounceHeight;
    
    // Add a slight circular motion
    const circleRadius = 0.02;
    sphere.position.x = sphere.userData.originalPosition.x + Math.cos(time * 0.5 + sphere.userData.bounceOffset) * circleRadius;
    sphere.position.z = sphere.userData.originalPosition.z + Math.sin(time * 0.5 + sphere.userData.bounceOffset) * circleRadius;
    
    // Slow rotation
    sphere.rotation.x += 0.002;
    sphere.rotation.y += 0.002;
}

init();
animate();