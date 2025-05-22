<template>
  <div
    ref="chartContainer"
    class="chart-container"
  >
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, reactive, ref } from 'vue'
import { f1StepChartCsv, teamList } from '../constants'
import { useElementSize } from '@vueuse/core'

const chartContainer = ref(null)
const chartContainerSize = reactive(useElementSize(chartContainer))

interface F1Data {
  year: number
  Ferrari_AllCircuits?: number
  McLaren_AllCircuits?: number
  'Red Bull_AllCircuits'?: number
  Mercedes_AllCircuits?: number
  Ferrari_Melbourne?: number
  McLaren_Melbourne?: number
  'Red Bull_Melbourne'?: number
  Mercedes_Melbourne?: number
  // Add other properties from your CSV if necessary
}

onMounted(() => {
  const data = d3.csvParse(f1StepChartCsv, d3.autoType) as d3.DSVParsedArray<F1Data>

  const margin = { top: 20, right: 100, bottom: 30, left: 50 }
  const width = chartContainerSize.width
  const height = 500

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year) as [number, number])
    .range([margin.left, width - margin.right])

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => d3.max([
        d.Ferrari_AllCircuits,
        d.McLaren_AllCircuits,
        d['Red Bull_AllCircuits'],
        d.Mercedes_AllCircuits,
        d.Ferrari_Melbourne,
        d.McLaren_Melbourne,
        d['Red Bull_Melbourne'],
        d.Mercedes_Melbourne
      ].filter(v => v != null) as number[]))
    ])
    .nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line<{ year: number, value: number }>()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveStep)

  const nameList = teamList.map(({ name }) => name)
  const colorList = teamList.map(({ color }) => color)

  const colors = d3.scaleOrdinal<string>()
    .domain(nameList)
    .range(colorList)

  const series = nameList.flatMap(team => ([
    {
      name: team,
      type: 'AllCircuits',
      values: data.map(d => ({
        year: d.year,
        value: d[`${team}_AllCircuits` as keyof F1Data]
      })).filter(d => d.value != null) as { year: number, value: number }[]
    },
    {
      name: team,
      type: 'Melbourne',
      values: data.map(d => ({
        year: d.year,
        value: d[`${team}_Melbourne` as keyof F1Data]
      })).filter(d => d.value != null) as { year: number, value: number }[]
    }
  ]))

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  svg.selectAll('.line')
    .data(series)
    .join('path')
    .attr('class', 'line')
    .attr('stroke', d => colors(d.name))
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', d => d.type === 'AllCircuits' ? ('5,5') : null)
    .attr('d', d => line(d.values))

  svg.selectAll('.legend')
    .data(nameList) // Use teams for legend to avoid duplicate names
    .join('text')
    .attr('x', width - margin.right + 10)
    .attr('y', (d, i) => margin.top + i * 20)
    .text(d => d)
    .attr('fill', d => colors(d))
    .style('font-weight', 'bold')
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
}
</style>
