<template>
  <div
   ref="chartContainer" 
   class="chart-container">
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, ref } from 'vue'
import { f1StepChartCsv } from '../constants'

const chartContainer = ref(null)



onMounted(() => {
  const data = d3.csvParse(f1StepChartCsv, d3.autoType)
  const margin = { top: 20, right: 100, bottom: 30, left: 50 }
  const width = 900
  const height = 500

  const svg = d3.select(chartContainer.value)
    .append('svg')
    .attr('width', width)
    .attr('height', height)

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([margin.left, width - margin.right])

  const y = d3.scaleLinear()
    .domain([
      0,
      d3.max(data, d => d3.max([
        d.Ferrari_AllCircuits,
        d.McLaren_AllCircuits,
        d['Red Bull_AllCircuits'],
        d.Mercedes_AllCircuits
      ].filter(v => v != null)))
    ])
    .nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.value))
    .curve(d3.curveStep)

  const teams = ['Ferrari', 'McLaren', 'Red Bull', 'Mercedes']
  const colors = d3.scaleOrdinal()
    .domain(teams)
    .range(['red', 'orange', 'blue', 'gray'])

  const series = teams.map(team => ({
    name: team,
    values: data.map(d => ({
      year: d.year,
      value: d[team + '_AllCircuits']
    })).filter(d => d.value != null)
  }))

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
    .attr('d', d => line(d.values))

  svg.selectAll('.legend')
    .data(series)
    .join('text')
    .attr('x', width - margin.right + 10)
    .attr('y', (d, i) => margin.top + i * 20)
    .text(d => d.name)
    .attr('fill', d => colors(d.name))
    .style('font-weight', 'bold')
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
}
</style>
