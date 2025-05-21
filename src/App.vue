<template>
  <div class="flex flex-col">
    <section-1 class="min-h-[100vh]" />
    <section-2 v-model="isSection2Open" />
    <section-3
      ref="section3"
      class="min-h-[100vh]"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from 'vue'
import Section1 from './section-1.vue'
import Section2 from './section-2.vue'
import Section3 from './section-3.vue'
import { useElementVisibility, whenever } from '@vueuse/core'

const isSection2Open = ref(true)

const section3Ref = useTemplateRef('section3')
const isSection3Visible = useElementVisibility(section3Ref)
whenever(isSection3Visible, () => {
  isSection2Open.value = false
})
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
