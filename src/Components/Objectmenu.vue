<template>
    <div :style="{ top: position.top + 'px', right: position.right + 'px'}" class="object-menu" v-if="selectedObject !== null">
        <h4>Selected Mesh</h4>
        <div class="object-menu__properties">
            <div class="object-property__position"  v-if="selectedObject !== null">
                <p class="position-lbl">Position</p>
                <div class="position-inputs">
                    <input class="position-input" type="text" @input="handleChangePos" v-model="selectedObject.position.x"/>
                    <input class="position-input" type="text" @input="handleChangePos" v-model="selectedObject.position.y" />
                    <input class="position-input" type="text" @input="handleChangePos" v-model="selectedObject.position.z" />
                </div>
                
            </div>
            <div class="object-property__texture">

                <ul>
                    <ol  v-for="textureType in texturesTypes">

                        <li class="texture__select-lbl">{{ textureType }}</li>

                        <li class="texture__select">
                            <select id="mesh-select" v-if="textureType !== 'sheen'">
                                <option></option>
                                <option v-for="textureValue in texturesValues" @click="handleTextureChange($event, textureType)" :value="textureValue" >{{ textureValue }}</option>
                            </select>

                            <select id="mesh-select" v-else>
                                <option></option>
                                <option @click="handleTextureChange($event, textureType)" :value="'velours'" >velours</option>
                            </select>

                        </li>

                    </ol>
                </ul>

            </div>
        </div>
        <div class="delete-object">
            <button @click="handleDeleteObject">Delete</button>
        </div>
    </div>
</template>

<script lang="ts">
    import * as THREE from 'three';
    import { PropType, defineComponent } from 'vue';

    export default defineComponent({
        data(){
            return {
                position: { top: 85, right: 100 },
                texturesTypes: ['albedo', 'normal', 'roughness', 'metalness', 'sheen'],
                texturesValues: ['wood', 'metal', 'velours', 'leather']
            }
        },
        props: {
            selectedObject: {
                type: [Object, null] as PropType<THREE.Mesh | null>,
                required: true,
            },
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
                let textureValue = (event.target as HTMLSelectElement).value

                if (textureValue ==="leather") textureValue += '.ktx2'
                else textureValue += '.png'
               
                this.$emit('changeTexture', {textureType, textureValue});
            }
        },
        emits: {
            changePos: (Obj: THREE.Mesh) => { return true },
            deleteObject: () => { return true },
            changeTexture: (texture: {textureType: string, textureValue: string}) => { return true },
        }
    })
</script>

<style scoped>
    h4 {
        margin-bottom: 10px;
    }
    .object-menu {
        position: absolute;
        max-width: 200px;
        width: 100%;
        background-color: gray;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 5px;
        border: 1px solid black;
    }
    .object-property__position {
        display: flex;
        flex-direction: row;
        width: 100%;
        
    }

    .position-lbl {
        width: 40%;
    }

    .position-inputs {
        width: 60%;
        display: flex;
        justify-content: space-between;
    }

    .position-input {
        text-align: center;
        width: 30%;
    }

    .object-property__texture {
        list-style: none;
    }

    .texture__select-lbl {
        width: 40%;
    }

    .texture__select {
        width: 60%;
    }

    ul {
        display: flex;
        flex-direction: column;
    }

    ol {
        display: flex;
        flex-direction: row;
        margin-top: 5px;
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
        padding: 5px 0;
        width: 100%;
        margin-top: 10px;
    }

</style>