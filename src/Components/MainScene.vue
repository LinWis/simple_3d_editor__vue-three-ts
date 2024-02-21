<template lang="">
    <div ref="container">
        <div ref="statsContainer"></div>
    </div>
    <Sidebar :textures="textures" @changeObject="handleChange" @changeMesh="createModel" :selectedObject="selectedObjectMenu"/> 
</template>

<script lang="ts">
    import { defineComponent, toRaw } from 'vue';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
    import Stats from 'three/examples/jsm/libs/stats.module.js';
    import Sidebar from './Sidebar.vue';
    import { TexturesContainer } from '../Interfaces/textures';

    export default defineComponent({
        name: 'Cube',

        data() {
            return {
                scene: new THREE.Scene(),
                camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
                renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
                loader: new GLTFLoader(),

                selectedObject: null as THREE.Mesh | null,
                selectedObjectMenu: null as THREE.Mesh | null,
                Meshes: [] as THREE.Mesh[],
                transformControls: null as TransformControls | null,
                stats: new Stats(),
                controls: null as OrbitControls | null,

                textures: null as TexturesContainer | null,

            }
        },

        mounted() {

            this.initTextures();

            const ambientlight = new THREE.AmbientLight(0xffffff, 0.5);
            const spotLight = new THREE.SpotLight(0xffffff, 20);
            const container = this.$refs.container as HTMLElement;
            
            this.camera.position.y = 1;
            this.camera.position.z = 5;

            let statsContainer = this.$refs.statsContainer as HTMLElement;
            statsContainer.appendChild(this.stats.dom);

            this.stats.dom.style.position = 'absolute';
            this.stats.dom.style.top = '30px';
            this.stats.dom.style.left = '30px';

            let resizeCallback = () => {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
            }

            window.addEventListener('resize', resizeCallback);

            spotLight.position.set(0, 5, 5);
            spotLight.target.position.set(0, 1, 0);
            this.scene.add(spotLight);
            this.scene.add(spotLight.target);
            this.scene.add(ambientlight);

            const gridHelper = new THREE.GridHelper(100, 100);
            this.scene.add(gridHelper);
            
            
            let controls = new OrbitControls(this.camera, container);
            controls.enableDamping = true;
            this.controls = controls;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(this.renderer.domElement);

            this.createModel("./Assets/cube.glb", "wood");
            if (this.controls) {
                this.addTransformControls(this.controls)
                this.animate(this.scene, this.camera, this.renderer);
            }

            document.addEventListener("mousedown", this.handleClick)
        },
        methods: {
            initTextures() {
                this.textures = {
                    albedo: [
                        {
                            name: 'wood',
                            url: '@/Assets/textures/albedo/albedo-wood.png',
                        },
                        {
                            name: 'metal',
                            url: '@/Assets/textures/albedo/albedo-metal.png',
                        },
                    ],
                    metalness: [
                        {
                            name: 'wood',
                            url: '@/Assets/Textures/metalness/metalness-wood.png',
                        },
                        {
                            name: 'metal',
                            url: '@/Assets/Textures/metalness/metalness-wood.png',
                        },
                    ],
                    normal: [
                        {
                            name: 'wood',
                            url: '@/Assets/Textures/normal/normal-wood.png',
                        },
                        {
                            name:'metal',
                            url: '@/Assets/Textures/normal/normal-metal.png',
                        },
                    ],
                    roughness: [
                        {
                            name: 'wood',
                            url: '@/Assets/Textures/normal/roughness-wood.png',
                        },
                        {
                            name:'metal',
                            url: '@/Assets/Textures/normal/roughness-metal.png',
                        },
                    ],
                    sheen: [
                        {
                            name: 'velours',
                            url: '@/Assets/Textures/sheen/sheen-velours.png',
                        },
                    ]
                }

            },
            menuClick(event: Event){
                if (this.controls) this.controls.enabled = false;
                    event.stopPropagation();
            },    
            addTransformControls(controls: OrbitControls) {
                this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
                this.scene.add(this.transformControls);

                this.transformControls.addEventListener('dragging-changed', event => {
                    controls.enabled = !event.value;
                });

                this.transformControls.addEventListener('objectChange', event => {
                    if (this.selectedObjectMenu && this.selectedObject) 
                        this.selectedObjectMenu.copy(this.selectedObject as THREE.Mesh)
                });

            },
            createModel(modelPath: string, texturePath: string) {

                if (!texturePath) texturePath = "metal";

                const loader: GLTFLoader = new GLTFLoader();

                loader.load(modelPath, (glb) => {

                    let loadedObject = glb.scene;

                    if (loadedObject) {

                        const textureLoader = new THREE.TextureLoader();

                        const material = new THREE.MeshStandardMaterial({
                            map: textureLoader.load('./Textures/albedo/albedo-' + texturePath + '.png'), // текстура альбедо
                            roughnessMap: textureLoader.load('./Textures/roughness/roughness-' + texturePath + '.png'), // текстура шероховатости
                            metalnessMap: textureLoader.load('./Textures/metalness/metalness-' + texturePath + '.png'),
                            normalMap: textureLoader.load('./Textures/normal/normal-' + texturePath + '.png')
                        });

                        if (loadedObject.children.length > 1) {
                            const meshGroup = new THREE.Group();

                            loadedObject.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    const meshChild = child as THREE.Mesh;
                                    meshChild.material = material;
                                    meshGroup.add(meshChild);
                                }
                            });
                            this.scene.add(meshGroup);
                        }
                        else {
                            let mesh = glb.scene.children[0] as THREE.Mesh;
                            mesh.material = material;
                            // if (this.transformControls)
                            //     this.transformControls.attach(mesh);

                            this.scene.add(mesh);
                            this.Meshes.push(mesh);
                        }
                    }

                });

            },
            animate(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.Renderer) {

                const animateFn = () => {
                    this.stats.begin();
                    requestAnimationFrame(animateFn);
                    const rawRenderer = toRaw(renderer);
                    const rawScene = toRaw(scene);
                    const rawCamera = toRaw(camera);

                    if (this.controls && this.controls.enabled) {
                        this.controls.update();
                    }

                    if (rawRenderer && rawScene && rawCamera) {
                        rawRenderer.render(rawScene, rawCamera);
                    }
                    this.stats.end();
                };
                this.stats.showPanel(0);
                animateFn();

            },
            getIntersectedObject(clientX: number, clientY: number){
                let object: THREE.Mesh | null = null;

                const raycaster = new THREE.Raycaster();
                const mouse = new THREE.Vector2();

                mouse.x = (clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(clientY / window.innerHeight) * 2 + 1;

                raycaster.setFromCamera(mouse, this.camera);

                for (const intersect of raycaster.intersectObjects(this.scene.children)) {
                    let obj = intersect.object as THREE.Mesh;
                    if (obj.type === "Mesh" && this.Meshes.indexOf(obj)!== -1) {
                        object = obj as THREE.Mesh;
                        break;
                    }
                }
                return object;
            },
            handleClick(event: MouseEvent) {

                // if (this.controls && !this.controls.enabled) this.controls.enabled =!this.controls.enabled;

                let selectedObject = this.getIntersectedObject(event.clientX, event.clientY);

                if (this.transformControls && selectedObject) {
                    this.transformControls.attach(selectedObject);
                    this.selectedObject = selectedObject;

                    this.selectedObjectMenu = new THREE.Mesh()
                    this.selectedObjectMenu.copy(selectedObject)

                }
            

            },
            handleChange(object: THREE.Mesh) {
                if (this.selectedObject)
                    this.selectedObject.copy(object)
            }  
        },

        components: {
            Sidebar
        }

    });
</script>

<style scoped>
</style>