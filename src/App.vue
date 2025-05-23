<template>
  <div class="flex flex-col">
    <section-1 class="min-h-[100vh] bg-[#222] text-white" />
    <section-2 class="bg-[#111] text-white" />
    <section-3 class="min-h-[100vh] bg-[#222] text-white" />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import Section1 from './section-1.vue'
import Section2 from './section-2.vue'
import Section3 from './section-3.vue'

</script>

<style lang="sass">
html, body, #app
  width: 100%
  height: 100%
  padding: 0
  margin: 0

#app
  display: flex
  flex-direction: column
</style>
