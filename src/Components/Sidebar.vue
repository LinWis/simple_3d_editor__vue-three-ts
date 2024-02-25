<template>
    <div class="sidebar" :style="{ top: position.top + 'px', right: position.right + 'px' }">
        <Dropdown @addObject="handleAddObject" /> 
        <Objectmenu @change-texture="handleChangeTexture" @delete-object="handleDeleteObject" @changePos="handleChangePos" :selectedObject="selectedObject" />  
    </div>
</template>

<script lang="ts">
    import { PropType, defineComponent } from 'vue';
    import Dropdown from './Dropdown.vue';
    import Objectmenu from './Objectmenu.vue';
    import * as THREE from 'three';

    export default defineComponent({
    data() {
        return {
            position: { top: 30, right: 100 }
        };
    },
    props: {
        selectedObject: {
            type: [Object, null] as PropType<THREE.Mesh | null>,
            required: true,
        },
    },
    methods: {
        handleAddObject(meshName: string) {
            this.$emit('addObject', meshName);
        },
        handleChangePos(newObject: THREE.Mesh) {

            this.$emit('changePos', ((new THREE.Mesh()).copy(newObject)));
        },
        handleDeleteObject() {
            this.$emit('deleteObject');    
        },
        handleChangeTexture(newTexture: {textureType: string, textureValue: string}) {
            this.$emit('changeTexture', newTexture);
        }
    },
    emits: {
        addObject: (meshName: string) => { return true },
        changePos: (obj: THREE.Mesh) => { return true },
        deleteObject: () => { return true },
        changeTexture: (newTexture: {textureType: string, textureValue: string}) => { return true }
    },

    components: { Dropdown, Objectmenu },
})
</script>

<style scoped>
    .sidebar {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px;
        background-color: grey;
        max-width: 250px;
        width: 100%;
        padding-top: 10px;
        padding-bottom: 10px;
        border: 2px solid black;
    }

</style>