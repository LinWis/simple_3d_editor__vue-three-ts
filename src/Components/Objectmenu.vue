<template>
    <div class="object-menu" v-if="selectedObject !== null">
        <h3 style="margin: 10px 0;">Selected Mesh</h3>
        <div class="object-menu__properties">
            <div class="object-property__position">
                <p>Position</p>
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChange" v-model="selectedObject.position.x"/>
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChange" v-model="selectedObject.position.y" />
                <input class="position-input" type="text" v-if="selectedObject !== null" @input="handleChange" v-model="selectedObject.position.z" />
            </div>
            <div class="object-property__texture">

                <ul>
                    <ol v-for="textureType in Object.keys(textures)">

                        <li>{{ textureType }}</li>

                        <li>
                            <select id="mesh-select">
                                <option></option>
                                <option v-for=" texture in textures[textureType]" :value="texture.url">{{ texture.name }}</option>
                            </select>

                        </li>

                    </ol>
                </ul>

            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import { TexturesContainer } from '@/Interfaces/textures';
import * as THREE from 'three';
    import { defineComponent } from 'vue';

    export default defineComponent({
        props: {
            selectedObject: {
                type:  Object as () => THREE.Mesh,
                required: true,
            },
            textures: {
                type: Object as () => TexturesContainer,
                required: true,
            }
        },
        methods: {
            handleChange(event: Event) {
                const newObject = this.selectedObject.clone() as THREE.Mesh;
                this.$emit('changeobj', newObject);
            }
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

</style>