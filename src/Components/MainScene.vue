<template lang="">
    <div ref="container">
        <div ref="statsContainer"></div>
    </div>
    <Dropdown @addObject="createModel" />
    <Objectmenu @change-texture="handleChangeTexture" @delete-object="handleDeleteObject" @changePos="handleChangePos" :selectedObject="selectedObject" />
</template>

<script lang="ts">
    import Dropdown from './Dropdown.vue';
    import Objectmenu from './Objectmenu.vue';

    import { defineComponent, toRaw } from 'vue';
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
    import Stats from 'three/examples/jsm/libs/stats.module.js';
    import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
    import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
    

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
                meshes: [] as THREE.Mesh[],  // Массив всех объектов на сцене(кроме служебных)
                transformControls: null as TransformControls | null, // Управление выделенным объектом
                stats: new Stats(),  // Fps индикатор
                controls: null as OrbitControls | null,  // Управление камерой
            }
        },

        mounted() {

            const environment = new RoomEnvironment();
            const pmremGenerator = new THREE.PMREMGenerator( this.renderer );
            this.scene.environment = pmremGenerator.fromScene( environment ).texture;
            environment.dispose();

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

            document.addEventListener("mousedown", this.handleMouseDown)
            window.addEventListener('resize', () => {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix()
            });
            

            this.createModel('cube', "metal");
            if (this.controls) {
                this.addTransformControls(this.controls)
                this.animate(this.scene, this.camera, this.renderer);
            }

        },
        methods: {
            // Здесь вроде как должна быть подгрузка текстур с бэка
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
            createModel(meshName: string, texturePath: string) {
                if (!texturePath) texturePath = 'metal'

                const loader: GLTFLoader = new GLTFLoader()

                loader.load(`./Assets/geometries/${meshName}.glb`, (glb) => {

                    let loadedObject = glb.scene;
                    if (loadedObject) {
                        const mesh = glb.scene.children[0];
                        const textureLoader = new THREE.TextureLoader()

                        const texture = textureLoader.load(`./Assets/textures/albedo/albedo-${texturePath}.png`)
                        
                        texture.wrapS = THREE.RepeatWrapping;
                        texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(2, 2);
                        texture.colorSpace = THREE.SRGBColorSpace;

                        const material = new THREE.MeshStandardMaterial({
                            map: texture,
                            metalnessMap: textureLoader.load(`./Assets/textures/metalness/metalness-${texturePath}.png`),
                            normalMap: textureLoader.load(`./Assets/textures/normal/normal-${texturePath}.png`),
                            roughnessMap: textureLoader.load(`./Assets/textures/roughness/roughness-${texturePath}.png`),
                            normalScale: new THREE.Vector2(0.01, 0.01),
                        })

                        

                        // Проверяем что объект состоит из нескольких мэшей и объединяем их
                        // if (loadedObject.children.length > 1) {
                        //     const meshGroup = new THREE.Group();

                        //     loadedObject.traverse((child) => {
                        //         if (child instanceof THREE.Mesh) {
                        //             const meshChild = child as THREE.Mesh;
                        //             meshChild.material = material;
                        //             meshChild.material.needsUpdate = true;

                        //             meshGroup.add(meshChild);
                        //             this.Meshes.push(meshChild);
                        //         }
                        //     });
                            
                        //     this.scene.add(meshGroup);
                        // }
                        // else {
                        //     const mesh = glb.scene.children[0] as THREE.Mesh;

                        //     mesh.material = material;

                        //     this.scene.add(mesh);
                        //     this.Meshes.push(mesh);
                        // }

                        // let mat;
                        glb.scene.traverse( function( object ) {  
                            if ((object instanceof THREE.Mesh))
                            { 
                                object.material = material;
                                object.material.needsUpdate = true;

                            } 
                        });

                        this.scene.add(mesh);
                        this.meshes.push((mesh as THREE.Mesh));
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
                    if (obj.type === "Mesh" && this.meshes.indexOf(obj)!== -1) {
                        object = obj as THREE.Mesh;
                        break;
                    }
                }
                return object;
            },

            // Нажатие по объекту
            handleMouseDown(event: MouseEvent) {

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
            async handleChangeTexture(newTexture: {textureType: string, textureValue: string}) {
                if (this.selectedObject && this.selectedObject.material) {

                    let material =  this.selectedObject.material as THREE.MeshStandardMaterial;
                    var texture;
                    const texturePath = `./Assets/textures/${newTexture.textureType}/${newTexture.textureType}-${newTexture.textureValue}`

                    if (texturePath.endsWith('.png') || texturePath.endsWith('.jpg') || texturePath.endsWith('.jpeg')) {
                        texture = await new THREE.TextureLoader().loadAsync(texturePath);
                    }
                    else {
                        
                        var ktx2Loader = new KTX2Loader();
                        let THREE_PATH = `https://unpkg.com/three@0.${THREE.REVISION}.x`;
                        ktx2Loader.setTranscoderPath(`${THREE_PATH}/examples/jsm/libs/basis/`)
                        ktx2Loader.detectSupport( this.renderer );
                        
                        texture = await ktx2Loader.loadAsync( texturePath );
                        texture.minFilter = THREE.NearestMipmapNearestFilter;

                        ktx2Loader.dispose();
                        
                    }
                    if (!texture) return;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.repeat.set(2, 2);
                    texture.colorSpace = THREE.SRGBColorSpace;

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
                            material.emissiveMap = texture;
                            break;
                        default:
                            console.error('Unsupported texture type');
                            break;
                    }

                    material.needsUpdate = true;
                }
            }
        },

        components: { Dropdown, Objectmenu },

    });
</script>

<style scoped>
</style>