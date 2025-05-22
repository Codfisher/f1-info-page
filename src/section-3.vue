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
            :class="{
              'opacity-100': teamName === item.name,
              'opacity-40': teamName !== item.name,
            }"
            @click="setTeamName(item.name)"
          ></q-btn>
        </div>
      </div>

      <f1-step-chart
        :team-name="teamName"
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

const teamName = ref<string>('Ferrari')
function setTeamName(name: string) {
  if (teamName.value === name) {
    teamName.value = ''
    return
  }
  teamName.value = name
}

// 強制重繪
setTimeout(() => {
  teamName.value = 'McLaren'
  setTimeout(() => {
    teamName.value = ''
  }, 1000)
}, 1000)
</script>

<style scoped lang="sass">
</style>
