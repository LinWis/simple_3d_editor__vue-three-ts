<template>
    <div class="sidebar" :style="{ top: position.top + 'px', right: position.right + 'px' }">
        <Dropdown @changeMesh="changeMesh" /> 
        <Objectmenu :textures="textures" @changeobj="handleChange" :selectedObject="selectedObject" />  
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import Dropdown from './Dropdown.vue';
    import Objectmenu from './Objectmenu.vue';
    import * as THREE from 'three';

    import { TexturesContainer } from '@/Interfaces/textures';

    export default defineComponent({
    data() {
        return {
            position: { top: 30, right: 100 }
        };
    },
    props: {
        selectedObject: {
            type:  Object as () => THREE.Mesh,
            required: true,
        },
        textures: {
            type: Object as () => TexturesContainer,
            required: true,
        },
    },
    methods: {
        changeMesh(mesh: string) {
            console.log(mesh)
            this.$emit('changeMesh', "./Assets/" + mesh + ".glb");
        },
        handleChange(newObject: THREE.Mesh) {
            const obj = new THREE.Mesh
            obj.copy(newObject);

            this.$emit('changeObject', obj);
        },  
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