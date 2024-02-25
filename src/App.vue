<template>
  <Cube />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import Cube from '@/Components/MainScene.vue';

  export default defineComponent({
    name: 'App',
    components: {
      Cube,
    }
  })
</script>

<style>
  *, ul, li{
    margin: 0;
    padding: 0;
    margin-left: 0; 
    padding-left: 0;
    list-style: none;
    box-sizing: content-box;
    font-size: 13px;
  }

  canvas {
    width: 100vw;
    height: 100vh
  }

  input, select, button {
    border-radius: 0%;
    border: none;
    font-size: 13px;
  }

</style>
