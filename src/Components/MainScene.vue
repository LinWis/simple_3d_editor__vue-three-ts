<template lang="">
    <div ref="container">
        <div ref="statsContainer"></div>
    </div>
    <Sidebar @change-texture="handleChangeTexture" @delete-object="handleDeleteObject" @changePos="handleChangePos" @addObject="createModel" :textures="textures" :selectedObject="selectedObjectMenu"/> 
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
    import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

    export default defineComponent({
        name: 'Cube',

        data() {
            return {
                scene: new THREE.Scene(),
                camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
                renderer: new THREE.WebGLRenderer({ antialias: true, alpha: true }),
                loader: new GLTFLoader(),

                selectedObject: null as THREE.Mesh | null,  // Объект по которому мы нажали
                selectedObjectMenu: null as THREE.Mesh | null, // Нужен для двустронней связи с дочерним компонентом
                Meshes: [] as THREE.Mesh[],  // Массив всех объектов на сцене(кроме служебных)
                transformControls: null as TransformControls | null, // Управление выделенным объектом
                stats: new Stats(),  // Fps индикатор
                controls: null as OrbitControls | null,  // Управление камерой

                textures: null as TexturesContainer | null,  // Доступные текстур
                ktx2Loader: null as KTX2Loader | null,

            }
        },

        created() {
            // Инициализируем KTX2Loader при создании компонента
            this.initializeKTX2Loader();
        },

        mounted() {

            const ambientlight = new THREE.AmbientLight(0xffffff, 0.7);
            this.scene.add(ambientlight);

            this.camera.position.y = 1;
            this.camera.position.z = 5;

            let statsContainer = this.$refs.statsContainer as HTMLElement;
            statsContainer.appendChild(this.stats.dom);

            this.stats.dom.style.position = 'absolute';
            this.stats.dom.style.top = '30px';
            this.stats.dom.style.left = '30px';

            const gridHelper = new THREE.GridHelper(100, 100);
            this.scene.add(gridHelper);
            
            const container = this.$refs.container as HTMLElement;

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            container.appendChild(this.renderer.domElement);

            this.controls = new OrbitControls(this.camera, container);
            this.controls.enableDamping = true;


            document.addEventListener("mousedown", this.handleClick)
            window.addEventListener('resize', () => {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix()
            });
            

            this.initTextures();

            this.createModel("./Assets/cube.glb", "wood");
            if (this.controls) {
                this.addTransformControls(this.controls)
                this.animate(this.scene, this.camera, this.renderer);
            }

        },
        methods: {
            initializeKTX2Loader() {
                let THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`;

                // Создаем и инициализируем KTX2Loader
                this.ktx2Loader = new KTX2Loader()
                    .setTranscoderPath(`${THREE_PATH}/examples/jsm/libs/basis/`)
                    .detectSupport(this.renderer); // Если у вас есть this.renderer, вам нужно его передать

                // Другие настройки KTX2Loader, если необходимо
            },
            // Здесь вроде как должна быть подгрузка текстур с бэка
            initTextures() {
                this.textures = {
                    albedo: [
                        {
                            name: 'wood',
                            url: '/albedo/albedo-wood.png',
                        },
                        {
                            name: 'metal',
                            url: '/albedo/albedo-metal.png',
                        },
                        {
                            name: 'leather',
                            url: '/albedo/albedo-leather.ktx2',
                        },
                        {
                            name: 'velours',
                            url: '/albedo/albedo-velours.png',
                        },
                    ],
                    metalness: [
                        {
                            name: 'wood',
                            url: '/metalness/metalness-wood.png',
                        },
                        {
                            name: 'metal',
                            url: '/metalness/metalness-wood.png',
                        },
                        {
                            name: 'leather',
                            url: '/metalness/metalness-leather.ktx2',
                        },
                        {
                            name: 'velours',
                            url: '/metalness/metalness-velours.png',
                        },
                    ],
                    normal: [
                        {
                            name: 'wood',
                            url: '/normal/normal-wood.png',
                        },
                        {
                            name:'metal',
                            url: '/normal/normal-metal.png',
                        },
                        {
                            name: 'leather',
                            url: '/normal/normal-leather.ktx2',
                        },
                        {
                            name: 'velours',
                            url: '/normal/normal-velours.png',
                        },
                    ],
                    roughness: [
                        {
                            name: 'wood',
                            url: '/roughness/roughness-wood.png',
                        },
                        {
                            name:'metal',
                            url: '/roughness/roughness-metal.png',
                        },
                        {
                            name: 'leather',
                            url: '/roughness/roughness-leather.ktx2',
                        },
                        {
                            name: 'velours',
                            url: '/roughness/roughness-velours.png',
                        },
                    ],
                    sheen: [
                        {
                            name: 'velours',
                            url: '/sheen/sheen-velours.png',
                        },
                    ]
                }
            }, 
            addTransformControls(controls: OrbitControls) {
                this.transformControls = new TransformControls(this.camera, this.renderer.domElement);
                this.scene.add(this.transformControls);

                this.transformControls.addEventListener('dragging-changed', event => {
                    controls.enabled = !event.value;
                });

                // Для отображения изменений в дочернем компоненте
                this.transformControls.addEventListener('objectChange', event => {
                    if (this.selectedObjectMenu && this.selectedObject) 
                        this.selectedObjectMenu.copy(this.selectedObject as THREE.Mesh)
                });

            },
            async getTexture(texturePath: string): Promise<THREE.MeshStandardMaterial> {
                if (!texturePath) texturePath = "wood";

                const textureLoader = new THREE.TextureLoader();

                // Создаем промисы для загрузки текстур
                const albedoPromise = new Promise<THREE.Texture>((resolve, reject) => {
                    textureLoader.load('./Textures/albedo/albedo-' + texturePath + '.png', resolve, undefined, reject);
                });

                const roughnessPromise = new Promise<THREE.Texture>((resolve, reject) => {
                    textureLoader.load('./Textures/roughness/roughness-' + texturePath + '.png', resolve, undefined, reject);
                });

                const metalnessPromise = new Promise<THREE.Texture>((resolve, reject) => {
                    textureLoader.load('./Textures/metalness/metalness-' + texturePath + '.png', resolve, undefined, reject);
                });

                const normalPromise = new Promise<THREE.Texture>((resolve, reject) => {
                    textureLoader.load('./Textures/normal/normal-' + texturePath + '.png', resolve, undefined, reject);
                });

                // Дожидаемся загрузки всех текстур
                const [albedo, roughness, metalness, normal] = await Promise.all([albedoPromise, roughnessPromise, metalnessPromise, normalPromise]);

                // Создаем материал и устанавливаем текстуры
                const material = new THREE.MeshStandardMaterial({
                    map: albedo,
                    roughnessMap: roughness,
                    metalnessMap: metalness,
                    normalMap: normal,
                });

                return material;
            },
            createModel(modelPath: string, texturePath: string) {

                const loader: GLTFLoader = new GLTFLoader()
                if (this.ktx2Loader) loader.setKTX2Loader(this.ktx2Loader.detectSupport(this.renderer));

                loader.load(modelPath, async (glb) => {

                    let loadedObject = glb.scene;
                    if (loadedObject) {

                        const material = await this.getTexture(texturePath);

                        // Проверяем что объект состоит из нескольких мэшей и объединяем их
                        if (loadedObject.children.length > 1) {
                            const meshGroup = new THREE.Group();

                            loadedObject.traverse((child) => {
                                if (child instanceof THREE.Mesh) {
                                    const meshChild = child as THREE.Mesh;
                                    meshChild.material = material;
                                    meshGroup.add(meshChild);
                                    this.Meshes.push(meshChild);
                                }
                            });
                            
                            this.scene.add(meshGroup);
                        }
                        else {
                            const mesh = glb.scene.children[0] as THREE.Mesh;

                            mesh.material = new THREE.MeshStandardMaterial();
                            const meshMaterial = mesh.material as THREE.MeshStandardMaterial;

                            meshMaterial.map = material.map;
                            meshMaterial.roughnessMap = material.roughnessMap;
                            meshMaterial.metalnessMap = material.metalnessMap;
                            meshMaterial.normalMap = material.normalMap;
                            mesh.material = meshMaterial


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
            // Получаем объект по которому нажали, либо ничего
            getIntersectedObject(clientX: number, clientY: number): THREE.Mesh | null {
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
            // Нажатие по объекту
            handleClick(event: MouseEvent) {

                let selectedObject = this.getIntersectedObject(event.clientX, event.clientY);

                if (this.transformControls && selectedObject) {
                    this.transformControls.attach(selectedObject);
                    this.selectedObject = selectedObject;

                    this.selectedObjectMenu = new THREE.Mesh()
                    this.selectedObjectMenu.copy(selectedObject)

                }

            },
            // Срабатывает если в дочернем классе изменили выделенный объект
            handleChangePos(object: THREE.Mesh) {
                if (this.selectedObject)
                    this.selectedObject.copy(object)
            },
            handleDeleteObject() {
                if (this.selectedObject) {
                    if (this.transformControls)
                        this.transformControls.detach();
                    this.scene.remove(this.selectedObject);
                    this.selectedObject = null;
                    this.selectedObjectMenu = null;
                }
            },
            handleChangeTexture(newTexture: {texturePath: string, textureType: string}) {
                if (this.selectedObject && this.selectedObject.material) {

                    let material =  this.selectedObject.material as THREE.MeshStandardMaterial;
                    let texture = new THREE.Texture();

                    if (newTexture.texturePath.endsWith('.ktx2') && this.ktx2Loader) {
                        let ktx2Loader = toRaw(this.ktx2Loader);
                        ktx2Loader.load('./Textures/' +  newTexture.texturePath, function ( texture ) {
                            material = new THREE.MeshStandardMaterial( { map: texture } );
                        });
                    }
                    else {
                        texture = new THREE.TextureLoader().load('./Textures/' + newTexture.texturePath);
                    }

                    switch (newTexture.textureType) {
                        case 'albedo':
                            material.map = texture;
                            break;
                        case 'roughness':
                            material.roughnessMap = texture;
                            break;
                        case 'metalness':
                            material.metalnessMap = texture;
                            break;
                        case 'normal':
                            material.normalMap = texture;
                            break;
                        case 'sheen':
                            material.envMap = texture;
                            material.envMapIntensity = 1;
                            break;
                        default:
                            console.error('Unsupported texture type');
                            break;
                    }
                }
            }
        },

        components: {
            Sidebar
        }

    });
</script>

<style scoped>
</style>