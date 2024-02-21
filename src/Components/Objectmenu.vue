<template>
    <div class="object-menu" v-if="selectedObject !== null">
        <h3 style="margin: 10px 0;">Selected Mesh</h3>
        <div class="object-menu__properties">
            <div class="object-property__position">
                <p>Position</p>
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChangePos" v-model="selectedObject.position.x"/>
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChangePos" v-model="selectedObject.position.y" />
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChangePos" v-model="selectedObject.position.z" />
            </div>
            <div class="object-property__texture">

                <ul>
                    <ol v-if="textures !== null" v-for="textureType in Object.keys(textures)">

                        <li>{{ textureType }}</li>

                        <li>
                            <select id="mesh-select">
                                <option></option>
                                <option @click="handleTextureChange($event, textureType)" v-for="texture in textures[textureType]" :value="texture.url">{{ texture.name }}</option>
                            </select>

                        </li>

                    </ol>
                </ul>

            </div>
        </div>
        <div class="delete-object">
            <button @click="handleDeleteObject">Удалить</button>
        </div>
    </div>
</template>

<script lang="ts">
    import { TexturesContainer } from '@/Interfaces/textures';
import * as THREE from 'three';
    import { PropType, defineComponent } from 'vue';

    export default defineComponent({
        props: {
            selectedObject: {
                type: [Object, null] as PropType<THREE.Mesh | null>,
                required: true,
            },
            textures: {
                type: [Object, null] as PropType<TexturesContainer | null>,
                required: true,
            }
        },
        methods: {
            handleChangePos() {
                if (this.selectedObject!== null) {
                    this.$emit('changePos', (this.selectedObject.clone() as THREE.Mesh));
                }
            },
            handleDeleteObject() {
                this.$emit('deleteObject');
            },
            handleTextureChange(event: Event, textureType: string) {
                const texturePath = (event.target as HTMLSelectElement).value
                this.$emit('changeTexture', {texturePath, textureType});
            }
        },
        emits: {
            changePos: (Obj: THREE.Mesh) => { return true },
            deleteObject: () => { return true },
            changeTexture: (texture: {texturePath: string, textureType: string}) => { return true },
        }
    })
</script>

<style scoped>
    .object-menu {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 200px;
    }

    .object-property__position {
        display: flex;
        flex-direction: row;
        
    }

    .position-input {
        width: 25%;
        margin-left: 5px;
    }

    .object-property__texture {
        list-style: none;
    }

    ul {
        display: flex;
        flex-direction: column;
    }

    ol {
        display: flex;
        flex-direction: row;
    }

    li {
        margin-top: 3px;
        width: 100%;
    }

    li select {
        margin-left: auto;
        width: 100%;
    }

    .delete-object {
        width: 100%;
    }
    .delete-object button {
        width: 100%;
        margin-top: 10px;
    }

</style>