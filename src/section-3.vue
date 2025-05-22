<template>
  <div class="flex flex-col flex-nowrap items-center  p-10 gap-4 text-base ">
    <div class="  text-3xl ">
      The Unpredictable Elite: Top Teams’ Albert Park Mastery (1996-2024)
    </div>

    <div class="w-full ">
      <!-- team filter -->
      <div class="">
        <div class="flex gap-4 justify-center">
          <q-btn
            v-for="item in teamList"
            :key="item.name"
            :label="item.fullName"
            size="lg"
            no-caps
            color="primary"
            rounded
            class="!px-[40px]"
            @click="teamName = item.name"
          ></q-btn>
        </div>
      </div>

      <div
        class=" relative"
        :style="{ height: `${windowSize.height / 2}px` }"
      >
        <transition name="opacity">
          <f1-step-chart
            :key="chartKey"
            :team-name="teamName"
            :year-range="yearRange"
            class=" absolute"
          />
        </transition>
      </div>

      <f1-period-tabs
        v-model="period"
        class=" w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import F1PeriodTabs, { Period } from './components/f1-period-tabs.vue';
import F1StepChart from './components/f1-step-chart.vue';
import { teamList } from './constants';
import { useWindowSize } from '@vueuse/core';

const windowSize = reactive(useWindowSize())


const periodYearRangeMap: Record<
  Period, [number, number]
> = {
  'Raw Power': [1996, 2000],
  'Aero Revolution': [2001, 2009],
  'Pre-Hybrid': [2010, 2013],
  'Hybrid Domination': [2014, 2021],
  'Ground Era': [2022, 2024],
}

const period = ref<Period | ''>('')
const yearRange = computed(() => {
  if (period.value === '') return
  return periodYearRangeMap[period.value]
})

const teamName = ref<string>()

const chartKey = ref(0)
watch(
  () => [teamName.value, yearRange.value],
  () => {
    chartKey.value += 1
  },
  { deep: true }
)
</script>

<style scoped lang="sass">
</style>
