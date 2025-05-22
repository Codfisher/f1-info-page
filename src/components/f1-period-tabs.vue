<template>
  <div class="flex flex-col py-10">
    <div class="flex gap-4 justify-center">
      <q-btn
        v-for="tab in periodList"
        :label="tab"
        size="lg"
        no-caps
        rounded
        outline
        class="!px-[40px] duration-200"
        :class="{ 'opacity-30': modelValue !== tab }"
        @click="setModelValue(tab)"
      ></q-btn>
    </div>

    <transition
      name="opacity"
      mode="out-in"
    >
      <div
        :key="info"
        class="p-10 px-14"
      >
        {{ info }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const periodList = [
  'Raw Power',
  'Aero Revolution',
  'Pre-Hybrid',
  'Hybrid Domination',
  'Ground Era',
] as const

export type Period = typeof periodList[number]

const modelValue = defineModel<Period | ''>()

function setModelValue(value: Period) {
  if (modelValue.value === value) {
    modelValue.value = ''
    return
  }

  modelValue.value = value
}

const infoMap: Record<Period, {
  description: string
}> = {
  'Raw Power': {
    description:
      `1996-2000 featured unrestricted 3.0L V10 engines
reaching 19,000 RPM, until 1998 regulations
mandated narrower 1.6m-wide cars and grooved
tires, cutting mechanical grip by 20%. 
`,
  },
  'Aero Revolution': {
    description: `2001-2009 saw F1 transition from V10 to restricted V8 engines while pushing aerodynamic extremes
with double diffusers, flexible wings, and mass dampers. Rule changes like 2005's single-lap qualifying
and 2009's 50% smaller wings plus KERS introduction radically altered car design and racing. This era's
regulatory shifts laid the foundation for modern F1's hybrid-focused engineering philosophy.`
  },
  'Pre-Hybrid': {
    description: `2010–2013 featured last naturally aspirated
period combined frozen V8 engines with
extreme aerodynamic exploitation, before
DRS standardization and exhaust flow
bans preceded the hybrid transition.`
  },
  'Hybrid Domination': {
    description: `2014–2021 was defined by the introduction of 1.6-liter V6 turbocharged power units integrating
advanced energy recovery systems, achieving unprecedented thermal efficiency exceeding
50%. The era progressively incorporated safety enhancements including halo cockpit
protection and standardized crash structures, alongside evolving aerodynamic regulations
aimed at improving overtaking opportunities through simplified front wing designs.`
  },
  'Ground Era': {
    description: `2022 presents F1's ground
effect revival with venturi
tunnels and 18-inch tires,
paired with cost caps.`
  }
}

const info = computed(() => {
  if (modelValue.value === '' || !modelValue.value) {
    return ''
  }

  return infoMap[modelValue.value].description
})
</script>

<style scoped lang="sass">
</style>
