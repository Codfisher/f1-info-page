<template>
  <div
    ref="chartContainer"
    class="chart-container"
  >
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'
import { onMounted, reactive, ref, watch } from 'vue' // Added watch
import { f1StepChartCsv, teamList } from '../constants'
import { useElementSize, useWindowSize } from '@vueuse/core'

interface Props {
  lineType?: 'AllCircuits' | 'Melbourne';
  teamName?: string; // Prop name is teamName
  yearRange?: [number, number];
}
const props = withDefaults(defineProps<Props>(), {
  lineType: undefined,
  teamName: undefined, // Prop name is teamName
  yearRange: () => [1996, 2024],
})

const chartContainer = ref<HTMLElement | null>(null)
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
}

// D3 selections will be stored here
let svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined
let xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let legendGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined

const drawChart = () => {
  if (!svgSelection || !xAxisGroup || !yAxisGroup || !linesGroup || !legendGroup || !chartContainer.value) {
    return
  }

  const rawCsvData = d3.csvParse(f1StepChartCsv, d3.autoType) as d3.DSVParsedArray<F1Data>
  const dataForSeriesGeneration = rawCsvData.filter(d => d.year >= props.yearRange[0] && d.year <= props.yearRange[1]);

  const margin = { top: 20, right: 100, bottom: 30, left: 50 }
  const width = chartContainerSize.width
  const height = windowSize.height / 2

  svgSelection.attr('width', width).attr('height', height);

  const x = d3.scaleLinear()
    .domain(props.yearRange)
    .range([margin.left, width - margin.right])

  let baseSeries = teamList.flatMap(teamInfo => {
    const currentTeamName = teamInfo.name;
    const seriesForTeam = [];

    const allCircuitsValues = dataForSeriesGeneration
      .map(d => ({ year: d.year, value: d[`${currentTeamName}_AllCircuits` as keyof F1Data] }))
      .filter(d => d.value != null) as { year: number, value: number }[];
    if (allCircuitsValues.length > 0) {
      seriesForTeam.push({ name: currentTeamName, type: 'AllCircuits', values: allCircuitsValues });
    }

    const melbourneValues = dataForSeriesGeneration
      .map(d => ({ year: d.year, value: d[`${currentTeamName}_Melbourne` as keyof F1Data] }))
      .filter(d => d.value != null) as { year: number, value: number }[];
    if (melbourneValues.length > 0) {
      seriesForTeam.push({ name: currentTeamName, type: 'Melbourne', values: melbourneValues });
    }
    return seriesForTeam;
  });

  let filteredSeries = baseSeries;
  if (props.teamName) {
    filteredSeries = filteredSeries.filter(s => s.name === props.teamName);
  }
  if (props.lineType) {
    filteredSeries = filteredSeries.filter(s => s.type === props.lineType);
  }
  filteredSeries = filteredSeries.filter(s => s.values.length > 0);

  const y = d3.scaleLinear()
    .domain([0, d3.max(filteredSeries, s => d3.max(s.values, v => v.value)) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top])

  const line = d3.line<{ year: number, value: number }>()
    .x(d => x(d.year) as number)
    .y(d => y(d.value) as number)
    .curve(d3.curveStep)

  const colors = d3.scaleOrdinal<string>()
    .domain(teamList.map(t => t.name))
    .range(teamList.map(t => t.color))

  xAxisGroup
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .transition()
    .duration(750)
    .call(d3.axisBottom(x).tickFormat(d3.format('d')));

  yAxisGroup
    .attr('transform', `translate(${margin.left},0)`)
    .transition()
    .duration(750)
    .call(d3.axisLeft(y));

  linesGroup.selectAll<SVGPathElement, { name: string; type: string; values: { year: number; value: number }[] }>('.line')
    .data(filteredSeries, d => `${d.name}_${d.type}`)
    .join(
      enter => enter.append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', d => colors(d.name))
        .attr('stroke-dasharray', d => d.type === 'AllCircuits' ? '5,5' : null)
        .attr('d', d => line(d.values))
        .attr('opacity', 0)
        .call(s => s.transition().duration(750).attr('opacity', 1)),
      update => update
        .call(s => s.transition().duration(750)
          .attr('stroke', d => colors(d.name))
          .attr('stroke-dasharray', d => d.type === 'AllCircuits' ? '5,5' : null)
          .attr('d', d => line(d.values))
        ),
      exit => exit
        .call(s => s.transition().duration(750)
          .attr('opacity', 0)
          .remove()
        )
    );

  const displayedTeamNames = [...new Set(filteredSeries.map(s => s.name))];
  legendGroup.selectAll<SVGTextElement, string>('.legend-item')
    .data(displayedTeamNames, d => d) // Key function for object constancy
    .join(
      enter => enter.append('text')
        .attr('class', 'legend-item')
        .style('font-weight', 'bold')
        .attr('fill', d => colors(d))
        .attr('x', width - margin.right + 10)
        .attr('y', (d, i) => margin.top + i * 20)
        .text(d => d)
        .attr('opacity', 0)
        .call(s => s.transition().duration(750).attr('opacity', 1)),
      update => update
        .call(s => s.transition().duration(750)
          .attr('fill', d => colors(d))
          .attr('x', width - margin.right + 10)
          .attr('y', (d, i) => margin.top + i * 20)
          .text(d => d) // Text itself usually doesn't change for legend items if names are stable
        ),
      exit => exit
        .call(s => s.transition().duration(750)
          .attr('opacity', 0)
          .remove()
        )
    );
}

onMounted(() => {
  if (!chartContainer.value) return;

  // Initialize SVG and main groups once
  svgSelection = d3.select(chartContainer.value).append('svg');
  xAxisGroup = svgSelection.append('g').attr('class', 'x-axis');
  yAxisGroup = svgSelection.append('g').attr('class', 'y-axis');
  linesGroup = svgSelection.append('g').attr('class', 'lines-group');
  legendGroup = svgSelection.append('g').attr('class', 'legend-group');

  drawChart(); // Initial draw

  watch(
    [() => props.lineType, () => props.teamName, () => props.yearRange, () => chartContainerSize.width, () => windowSize.height],
    () => {
      drawChart();
    },
    {
      immediate: true,
      deep: true
    }
  );
})
</script>

<style scoped>
.chart-container {
  width: 100%;
  overflow-x: auto;
}
</style>
