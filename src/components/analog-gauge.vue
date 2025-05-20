<template>
  <div class="gauge-container">
    <svg
      viewBox="0 0 200 150"
      class="gauge"
    >
      <defs>
        <linearGradient
          id="needleGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="0%"
        >
          <stop
            offset="0%"
            :style="{ stopColor: needleColor, stopOpacity: 1 }"
          />
          <stop
            offset="100%"
            :style="{ stopColor: needleBaseColor, stopOpacity: 1 }"
          />
        </linearGradient>
      </defs>

      <!-- Background Arc -->
      <path
        d="M 30 100 A 70 70 0 0 1 170 100"
        :stroke="trackColor"
        stroke-width="20"
        fill="none"
        stroke-linecap="butt"
      />

      <!-- 長刻度 -->
      <g
        v-for="tick in longTicks"
        :key="tick.value"
      >
        <line
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          :stroke="tickColor"
          stroke-width="2"
        />
        <text
          :x="tick.textX"
          :y="tick.textY"
          fill="white"
          font-size="10"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          {{ tick.value }}
        </text>
      </g>

      <!-- 短刻度 -->
      <g
        v-for="tick in shortTicks"
        :key="tick.value"
      >
        <line
          :x1="tick.x1"
          :y1="tick.y1"
          :x2="tick.x2"
          :y2="tick.y2"
          :stroke="tickColor"
          stroke-width="2"
        />
      </g>

      <!-- 指針 -->
      <g :transform="`rotate(${needleRotation}, 100, 100)`">
        <!-- White circular base for the needle -->
        <circle
          cx="100"
          cy="100"
          r="5"
          fill="white"
        />
        <polygon
          points="100,25 103,95 97,95"
          fill="url(#needleGradient)"
          stroke="white"
          stroke-width="2"
          stroke-linejoin="miter"
        />
        <circle
          cx="100"
          cy="100"
          r="4"
          :fill="needleBaseColor"
        />
      </g>

      <text
        ref="target"
        x="100"
        y="125"
        text-anchor="middle"
        :fill="textColor"
        font-size="12"
        font-weight="bold"
      >
        {{ label }}
      </text>
      <text
        x="100"
        y="138"
        text-anchor="middle"
        :fill="textColor"
        font-size="10"
        font-weight="bold"
      >
        {{ value }}%
      </text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue';
import { useElementVisibility, useIntervalFn } from '@vueuse/core'
import { createAnimatable } from 'animejs'

interface Props {
  label?: string;
  value?: number; // Value from 0 to 90
  backgroundColor?: string;
  trackColor?: string;
  needleColor?: string;
  needleBaseColor?: string;
  tickColor?: string;
  textColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'British Grand Prix',
  value: 35,
  trackColor: '#4a4a4a',
  needleColor: '#e0e0e0',
  needleBaseColor: '#c0c0c0',
  tickColor: '#888',
  textColor: 'white',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const needleValue = ref(props.value);
const needleValueAni = createAnimatable(
  needleValue,
  {
    value: props.value,
    duration: 200,
  }
)

const textRef = useTemplateRef('target')
const textIsVisible = useElementVisibility(textRef)

useIntervalFn(() => {
  if (!textIsVisible.value) {
    needleValueAni.value?.(0)
    return;
  }

  const noise = Math.random() * 2 - 1
  needleValueAni.value?.(props.value + noise)
}, 100)

const needleRotation = computed(() => {
  return (needleValue.value * 2) - 90;
});

const longTicks = computed(() => {
  const tickValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const radius = 80;
  const innerRadius = radius - 30;
  const textRadius = radius + 10;
  const centerX = 100;
  const centerY = 100;

  return tickValues.map(value => {
    const angleRad = ((value * 2) - 180) * (Math.PI / 180);
    return {
      value,
      x1: centerX + innerRadius * Math.cos(angleRad),
      y1: centerY + innerRadius * Math.sin(angleRad),
      x2: centerX + radius * Math.cos(angleRad),
      y2: centerY + radius * Math.sin(angleRad),
      textX: centerX + textRadius * Math.cos(angleRad),
      textY: centerY + textRadius * Math.sin(angleRad),
    };
  });
});
const shortTicks = computed(() => {
  const tickValues = Array.from({ length: 46 }, (_, i) => i * 2);
  const radius = 80;
  const innerRadius = radius - 15;
  const textRadius = radius + 10;
  const centerX = 100;
  const centerY = 100;

  return tickValues.map(value => {
    const angleRad = ((value * 2) - 180) * (Math.PI / 180);
    return {
      value,
      x1: centerX + innerRadius * Math.cos(angleRad),
      y1: centerY + innerRadius * Math.sin(angleRad),
      x2: centerX + (radius - 2) * Math.cos(angleRad),
      y2: centerY + (radius - 2) * Math.sin(angleRad),
      textX: centerX + textRadius * Math.cos(angleRad),
      textY: centerY + textRadius * Math.sin(angleRad),
    };
  });
});

</script>

<style scoped lang="sass">
.gauge-container
  padding: 10px
  display: flex
  justify-content: center
  align-items: center

.gauge
  width: 100%
  height: 100%
</style>
