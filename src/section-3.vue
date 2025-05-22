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

      <f1-step-chart
        :key="teamName"
        :team-name="teamName"
      />

      <f1-period-tabs
        v-model="period"
        class=" w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import F1PeriodTabs, { Period } from './components/f1-period-tabs.vue';
import F1StepChart from './components/f1-step-chart.vue';
import { teamList } from './constants';

const period = ref<Period | ''>('')

const teamName = ref<string>()
</script>

<style scoped lang="sass">
</style>
