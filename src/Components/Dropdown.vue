<template>
    <div class="dropdown" :style="{ top: position.top + 'px', right: position.right + 'px' }">
        <select id="mesh-select">
            <option></option>
            <option value="cube">Cube</option>
            <option value="chair">chair</option>
            <option value="helmet">helmet</option>
            <option value="suzanne">suzanne</option>
        </select>

        <button @click="handleAddObject" id="mesh-add">Add mesh</button>
    </div>
</template>
  
<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'Dropdown',
        data() {
            return {
                position: { top: 30, right: 100 }
            }
        },
        methods: {
            handleAddObject() {
                const html = document.getElementById('mesh-select') as HTMLSelectElement;
                if (html.selectedIndex !== 0) {
                    this.$emit('addObject', html.value);
                }
            },
        }
    });
</script>

<style scoped>

    button {
        width: 40%;
        margin-left: 10px;
    }
    .dropdown {
        position: absolute;
        display: flex;
        flex-direction: row;
        background-color: gray;
        max-width: 200px;
        width: 100%;
        padding: 5px;
        border: 1px solid black;
    }
    #mesh-select {
        padding: 1px;
        margin-right: 1px;
        width: 60%;
        text-align: center;
    }
    #mesh-add {
        padding: 2px;
    }
</style>