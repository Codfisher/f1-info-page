<template>
  <div class="flex flex-col">
    <section-1 class="h-[100vh]" />
    <section-2 class="h-[100vh]" />
    <section-3 class="h-[100vh]" />
  </div>
</template>

<script setup lang="ts">
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
