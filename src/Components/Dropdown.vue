<template>
    <div class="dropdown">
        <select id="mesh-select">
            <option>Выберите объект</option>
            <option value="Cube">Куб</option>
            <option value="Chair">Стул</option>
            <option value="helmet">Шлем</option>
        </select>

        <button @click="changeMesh" id="mesh-add">Добавить</button>
    </div>
</template>
  
<script lang="ts">
    import { defineComponent } from 'vue';

    export default defineComponent({
        name: 'Dropdown',
        methods: {
            changeMesh() {
                const html = document.getElementById('mesh-select') as HTMLSelectElement;
                if (html.selectedIndex !== 0) {
                    this.$emit('changeMesh', html.value);
                }
            },
        }
    });
</script>

<style scoped>
    #mesh-select {
        padding: 2px;
        margin-right: 2px;
    }
    #mesh-add {
        padding: 2px;
    }
</style>