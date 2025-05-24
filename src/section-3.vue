<template>
  <div class="flex flex-col flex-nowrap items-center  p-10 gap-4 text-base ">
    <div class="  text-3xl ">
      The Unpredictable Elite: Top Teams’ Albert Park Mastery (1996-2024)
    </div>

    <div class="w-full ">
      <div class="flex gap-4 w-full justify-center">
        <!-- Points filter -->
        <div class=" border rounded-lg flex flex-col items-center p-4 gap-4">
          <div class=" text-lg">
            Points
          </div>

          <div class=" grid grid-cols-2 gap-4">
            <q-btn
              v-for="item in pointList"
              :key="item.label"
              :label="item.label"
              no-caps
              rounded
              color="white"
              class="duration-200 text-black"
              :class="{ 'opacity-30': lineType !== item.value }"
              @click="setLineType(item.value)"
            ></q-btn>
          </div>
        </div>

        <!-- team filter -->
        <div class=" border rounded-lg flex flex-col items-center p-4 gap-4">
          <div class=" text-lg">
            Constructors
          </div>

          <div class=" flex gap-4">
            <q-btn
              v-for="item in teamList"
              :key="item.name"
              :label="item.fullName"
              no-caps
              rounded
              class="duration-200"
              :style="{ background: item.color }"
              :class="{ 'opacity-30': !teamNameList.includes(item.name) }"
              @click="setTeamName(item.name)"
            ></q-btn>
          </div>
        </div>
      </div>

      <f1-step-chart
        :line-type="lineType"
        :team-name-list="teamNameList"
        :year-range="yearRange"
      />

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

const periodYearRangeMap: Record<
  Period, [number, number]
> = {
  'Raw Power': [1996, 2000],
  'Aero Revolution': [2001, 2009],
  'Pre-Hybrid': [2010, 2013],
  'Hybrid Domination': [2014, 2021],
  'Ground Era': [2023, 2024],
}

const period = ref<Period | ''>('')
const yearRange = computed(() => {
  if (period.value === '') return
  return periodYearRangeMap[period.value]
})

const teamNameList = ref<string[]>(['Ferrari'])
function setTeamName(name: string) {
  const index = teamNameList.value.indexOf(name)
  if (index > -1) {
    teamNameList.value.splice(index, 1)
  } else {
    teamNameList.value.push(name)
  }
}

const lineType = ref<'AllCircuits' | 'Melbourne' | ''>('')
function setLineType(name: 'AllCircuits' | 'Melbourne') {
  if (lineType.value === name) {
    lineType.value = ''
    return
  }
  lineType.value = name
}
const pointList = [
  { value: 'AllCircuits', label: '--- Sum of All Circuits' },
  { value: 'Melbourne', label: '― Abert Park Circuit' },
] as const

// 強制重繪
setTimeout(() => {
  teamNameList.value = ['McLaren']
  setTimeout(() => {
    teamNameList.value = []
  }, 1000)
}, 1000)
</script>

<style scoped lang="sass">
</style>
