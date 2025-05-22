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
import { useElementSize, useWindowSize } from '@vueuse/core'

interface Props {
  lineType?: 'AllCircuits' | 'Melbourne';
  teamName?: string;
  yearRange?: [number, number];
}
const props = withDefaults(defineProps<Props>(), {
  lineType: undefined,
  teamName: undefined,
  yearRange: () => [1996, 2024],
})

const chartContainer = ref(null)
const chartContainerSize = reactive(useElementSize(chartContainer))
const windowSize = reactive(useWindowSize())

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
  const rawCsvData = d3.csvParse(f1StepChartCsv, d3.autoType) as d3.DSVParsedArray<F1Data>

  // Filter rawData by yearRange first for series generation
  const dataForSeriesGeneration = rawCsvData.filter(d => d.year >= props.yearRange[0] && d.year <= props.yearRange[1]);

  const margin = { top: 20, right: 100, bottom: 30, left: 50 }
  const width = chartContainerSize.width
  const height = windowSize.height / 2

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3.scaleLinear()
    .domain(props.yearRange) // Use props.yearRange for x-axis domain
    .range([margin.left, width - margin.right])

  // Generate base series from dataForSeriesGeneration
  let baseSeries = teamList.flatMap(teamInfo => {
    const teamName = teamInfo.name;
    const seriesForTeam = [];

    // AllCircuits data
    const allCircuitsValues = dataForSeriesGeneration
      .map(d => ({ year: d.year, value: d[`${teamName}_AllCircuits` as keyof F1Data] }))
      .filter(d => d.value != null) as { year: number, value: number }[];
    if (allCircuitsValues.length > 0) {
      seriesForTeam.push({ name: teamName, type: 'AllCircuits', values: allCircuitsValues });
    }

    // Melbourne data
    const melbourneValues = dataForSeriesGeneration
      .map(d => ({ year: d.year, value: d[`${teamName}_Melbourne` as keyof F1Data] }))
      .filter(d => d.value != null) as { year: number, value: number }[];
    if (melbourneValues.length > 0) {
      seriesForTeam.push({ name: teamName, type: 'Melbourne', values: melbourneValues });
    }
    return seriesForTeam;
  });

  // Filter series based on props.teamName and props.lineType
  let filteredSeries = baseSeries;
  if (props.teamName) {
    filteredSeries = filteredSeries.filter(s => s.name === props.teamName);
  }
  if (props.lineType) {
    filteredSeries = filteredSeries.filter(s => s.type === props.lineType);
  }
  // Ensure we only keep series that still have values
  filteredSeries = filteredSeries.filter(s => s.values.length > 0);

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(filteredSeries, s => d3.max(s.values, v => v.value)) ?? 0 // Max of visible data, default to 0 if no data
    ])
    .nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line<{ year: number, value: number }>()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveStep)

  // Colors scale using all teams for consistency
  const colors = d3.scaleOrdinal<string>()
    .domain(teamList.map(t => t.name))
    .range(teamList.map(t => t.color))

  svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')))

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  svg.selectAll('.line')
    .data(filteredSeries) // Use the fully filtered series
    .join('path')
    .attr('class', 'line')
    .attr('stroke', d => colors(d.name))
    .attr('fill', 'none')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', d => d.type === 'AllCircuits' ? ('5,5') : null)
    .attr('d', d => line(d.values))

  // Legend based on teams present in filteredSeries
  const displayedTeamNames = [...new Set(filteredSeries.map(s => s.name))];
  svg.selectAll('.legend')
    .data(displayedTeamNames)
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
