<template>
  <div class="flex flex-col flex-nowrap items-center bg-[#222] p-10 gap-4 text-base text-white">
    <div class="  text-3xl ">
      The Unpredictable Elite: Top Teams’ Albert Park Mastery (1996-2024)
    </div>

    <div class="">
      <f1-tabs :tabs></f1-tabs>

    </div>
  </div>
</template>

<script setup lang="ts">
import F1Tabs from './components/f1-tabs.vue';

const tabs = [
  {
    title: 'Ferrari',
    description: 'Ferrari has been a dominant force in F1, especially at Albert Park.',
    years: '1996-2024',
  },
  {
    title: 'Mercedes',
    description: 'Mercedes has shown consistent performance at Albert Park.',
    years: '2014-2024',
  },
  {
    title: 'Red Bull Racing',
    description: 'Red Bull Racing has made significant strides at Albert Park.',
    years: '2009-2024',
  },
];
</script>

<style scoped lang="sass">
</style>
