let scene, camera, renderer, spheres = [];
let raycaster, mouse;
let clock = new THREE.Clock();
let isSubtitleChanged = false;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Custom shader material for gradient effect with shininess
    const gradientMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color1: { value: new THREE.Color(0xF0F0F0) },
            color2: { value: new THREE.Color(0xC0C0C0) },
            lightPosition: { value: new THREE.Vector3(5, 5, 5) }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vUv = uv;
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color1;
            uniform vec3 color2;
            uniform vec3 lightPosition;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            void main() {
                vec3 baseColor = mix(color1, color2, smoothstep(0.0, 1.0, vUv.y));
                vec3 lightDir = normalize(lightPosition - vViewPosition);
                float diffuse = max(dot(vNormal, lightDir), 0.0);
                float specular = pow(max(dot(reflect(-lightDir, vNormal), normalize(vViewPosition)), 0.0), 64.0);
                vec3 finalColor = baseColor * (0.2 + 0.8 * diffuse) + vec3(0.3) * specular;
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `
    });

    const numSpheres = 40;
    const minDistance = 0.1;

    for (let i = 0; i < numSpheres; i++) {
        const size = Math.random() * 0.3 + 0.3;
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const sphere = new THREE.Mesh(geometry, gradientMaterial);

        let position;
        let attempts = 0;
        do {
            position = getRandomPosition(1.8);
            attempts++;
        } while (isTooClose(position, size, minDistance) && attempts < 100);

        if (attempts < 100) {
            sphere.position.copy(position);
            sphere.userData = { 
                originalPosition: sphere.position.clone(), 
                velocity: new THREE.Vector3(),
                size: size
            };
            scene.add(sphere);
            spheres.push(sphere);
        }
    }

    camera.position.z = 5;
    camera.position.y = -0.2;

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('click', onDocumentClick, false);
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
        if (distance < (size + sphere.userData.size + minDistance)) {
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

function onDocumentClick(event) {
    event.preventDefault();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        toggleSubtitle();
    }
}

function toggleSubtitle() {
    const subtitle = document.getElementById('subtitle');
    if (isSubtitleChanged) {
        subtitle.textContent = 'software engineer.';
    } else {
        subtitle.textContent = 'frontend enthusiast.';
    }
    isSubtitleChanged = !isSubtitleChanged;
}

function animate() {
    requestAnimationFrame(animate);
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    if (intersects.length > 0) {
        const hoveredSphere = intersects[0].object;
        const pushForce = new THREE.Vector3().subVectors(hoveredSphere.position, camera.position).normalize().multiplyScalar(0.01);
        hoveredSphere.userData.velocity.add(pushForce);
    }

    updatePhysics();
    renderer.render(scene, camera);
}

function updatePhysics() {
    const damping = 0.98;
    const springStrength = 0.01;

    spheres.forEach(sphere => {
        const displacement = new THREE.Vector3().subVectors(sphere.userData.originalPosition, sphere.position);
        const springForce = displacement.multiplyScalar(springStrength);
        sphere.userData.velocity.add(springForce);

        sphere.position.add(sphere.userData.velocity);
        sphere.userData.velocity.multiplyScalar(damping);

        spheres.forEach(otherSphere => {
            if (sphere !== otherSphere) {
                const distance = sphere.position.distanceTo(otherSphere.position);
                const minDist = sphere.userData.size + otherSphere.userData.size;
                if (distance < minDist) {
                    const normal = new THREE.Vector3().subVectors(otherSphere.position, sphere.position).normalize();
                    const separationVector = normal.multiplyScalar(minDist - distance);
                    sphere.position.sub(separationVector.multiplyScalar(0.5));
                    otherSphere.position.add(separationVector.multiplyScalar(0.5));

                    const relativeVelocity = new THREE.Vector3().subVectors(sphere.userData.velocity, otherSphere.userData.velocity);
                    const impulse = normal.multiplyScalar(relativeVelocity.dot(normal) * 0.5);
                    sphere.userData.velocity.sub(impulse);
                    otherSphere.userData.velocity.add(impulse);
                }
            }
        });
    });
}

init();
animate();