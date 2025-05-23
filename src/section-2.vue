<template>
  <q-expansion-item
    v-model="modelValue"
    class=""
    hide-expand-icon
    :duration="1000"
  >
    <template #header>
      <div class="  text-3xl text-center w-full py-2 ">
        Conversion Rate
      </div>
    </template>

    <div class="flex flex-col flex-nowrap items-center  p-10 gap-4 text-base min-h-[100vh]">
      <div class=" ">
        Australia's 41% pole-to-win conversion rate underperforms even Monaco's, defying expectations for a circuit with
        more overtaking opportunities. This paradox
        reflects Albert Park's unique balance of speed and strategy - its flowing sectors enable tire and pit-stop
        advantages that frequently undo qualifying advantages.
      </div>

      <div class="flex flex-1 gap-4 content-center items-center justify-center">
        <analog-gauge
          v-for="item of list"
          :key="item.label"
          v-bind="item"
        />
      </div>
    </div>
  </q-expansion-item>

</template>

<script setup lang="ts">
import AnalogGauge from './components/analog-gauge.vue';

const modelValue = defineModel({
  type: Boolean,
  default: true
})

const list = [
  {
    label: 'British Grand Prix',
    value: 34.5,
    tickColor: '#888',
    trackList: [
      { start: 0, end: 30, color: '#252161' },
      { start: 30, end: 60, color: '#be1d2c' },
      { start: 60, end: 90, color: '#252161' },
    ],
  },

  {
    label: 'Hungarian Grand Prix',
    value: 37.9,
    trackList: [
      { start: 0, end: 30, color: '#be1d2c' },
      { start: 30, end: 60, color: '#FFF' },
      { start: 60, end: 90, color: '#00a54f' },
    ],
  },
  {
    label: 'Australian Grand Prix',
    value: 40.7,
    trackList: [
      { start: 0, end: 30, color: '#252161' },
      { start: 30, end: 60, color: '#FFF' },
      { start: 60, end: 90, color: '#252161' },
    ],
  },
  {
    label: 'Belgian Grand Prix',
    value: 40.7,
    trackList: [
      { start: 0, end: 30, color: '#231f20' },
      { start: 30, end: 60, color: '#ffdd17' },
      { start: 60, end: 90, color: '#be1d2c' },
    ],
  },
  {
    label: 'Canadian Grand Prix',
    value: 50,
    trackList: [
      { start: 0, end: 30, color: '#e91d23' },
      { start: 30, end: 60, color: '#FFF' },
      { start: 60, end: 90, color: '#e91d23' },
    ],
  },
  {
    label: 'Brazilian Grand Prix',
    value: 50,
    trackList: [
      { start: 0, end: 30, color: '#0d9344' },
      { start: 30, end: 60, color: '#26235b' },
      { start: 60, end: 90, color: '#ffdd17' },
    ],
  },
  {
    label: 'Monaco Grand Prix',
    value: 53.6,
    trackList: [
      { start: 0, end: 90, color: '#FFF' },
    ],
  },
  {
    label: 'Italian Grand Prix',
    value: 55.2,
    trackList: [
      { start: 0, end: 30, color: '#0d9344' },
      { start: 30, end: 60, color: '#FFF' },
      { start: 60, end: 90, color: '#e91d23' },
    ],
  },
  {
    label: 'Japanese Grand Prix',
    value: 55.5,
    trackList: [
      { start: 0, end: 30, color: '#FFF' },
      { start: 30, end: 60, color: '#e91d23' },
      { start: 60, end: 90, color: '#FFF' },
    ],
  },
  {
    label: 'Spanish Grand Prix',
    value: 72.4,
    trackList: [
      { start: 0, end: 30, color: '#ee1d23' },
      { start: 30, end: 60, color: '#f7931d' },
      { start: 60, end: 90, color: '#ee1d23' },
    ],
  },
]
</script>

<style scoped lang="sass">
</style>
