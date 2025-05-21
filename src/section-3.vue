<template>
  <div class="flex flex-col flex-nowrap items-center  p-10 gap-4 text-base ">
    <div class="  text-3xl ">
      The Unpredictable Elite: Top Teams’ Albert Park Mastery (1996-2024)
    </div>

    <div class="w-full ">
      <f1-tabs
        v-model="tab"
        class=" w-full"
      />

      <f1-step-chart />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import F1Tabs, { Tab } from './components/f1-tabs.vue';
import F1StepChart from './components/f1-step-chart.vue';

const tab = ref<Tab>('')
</script>

<style scoped lang="sass">
</style>
