<template>
  <div class="flex flex-col bg-[#222] text-white">
    <div class="p-10">
      <div class=" text-4xl text-center p-4">
        F1 MELBOURNE: THE MOST UNPREDICTABLE RACE
      </div>

      <div class="">
        As Formula 1's traditional season opener, Melbourne's Albert Park Circuit sets a chaotic tone for the
        championship. This poster examines how top constructors, Ferrari, Mercedes, Red Bull and McLaren, fluctuate
        dramatically at this
        unpredictable track compared to their seasonal performance. It reveals how Albert Park's unique challenges have
        exposed team vulnerabilities across different regulatory eras, from the V10 period to today's ground effect cars
      </div>
    </div>

    <section-1 class="min-h-[100vh]  " />
    <section-2 class="bg-[#111] " />
    <section-3 class="min-h-[100vh]  " />
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
