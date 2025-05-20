<template>
  <div class="flex gap-4 bg-[#222] items-center justify-center">
    <analog-gauge
      v-for="item of list"
      :key="item.label"
      v-bind="item"
    />
  </div>
</template>

<script setup lang="ts">
import AnalogGauge from './components/analog-gauge.vue';


const list = [
  {
    label: 'Spanish Grand Prix',
    value: 72.4,
  },
  {
    label: 'Japanese Grand Prix',
    value: 55.5,
  },
  {
    label: 'Italian Grand Prix',
    value: 55.2,
  },
  {
    label: 'Monaco Grand Prix',
    value: 53.6,
  },
  {
    label: 'Brazilian Grand Prix',
    value: 50,
  },
  {
    label: 'Canadian Grand Prix',
    value: 50,
  },
  {
    label: 'Australian Grand Prix',
    value: 40.7,
  },
  {
    label: 'Belgian Grand Prix',
    value: 40.7,
  },
  {
    label: 'Hungarian Grand Prix',
    value: 37.9,
  },
  {
    label: 'British Grand Prix',
    value: 34.5,
  },
]
</script>

<style scoped lang="sass">
</style>
