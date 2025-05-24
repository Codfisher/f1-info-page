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
  lineType?: 'AllCircuits' | 'Melbourne' | '';
  teamNameList?: string[];
  yearRange?: [number, number];
}
const props = withDefaults(defineProps<Props>(), {
  lineType: undefined,
  teamNameList: undefined,
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

interface HighlightBlock {
  teamName: string;
  startYear: number;
  endYear: number;
  color?: string;
}

// D3 selections will be stored here
let svgSelection: d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined
let xAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
// let yAxisGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let yAxisGroupLeft: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let yAxisGroupRight: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let linesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let legendGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined
let highlightBlocksGroup: d3.Selection<SVGGElement, unknown, null, undefined> | undefined;

const drawChart = () => {
  // if (!svgSelection || !xAxisGroup || !yAxisGroupLeft || !yAxisGroupRight || !linesGroup || !legendGroup || !chartContainer.value) {
  if (!svgSelection || !xAxisGroup || !yAxisGroupLeft || !yAxisGroupRight || !linesGroup || !legendGroup || !highlightBlocksGroup || !chartContainer.value) {
    return
  }

  const rawCsvData = d3.csvParse(f1StepChartCsv, d3.autoType) as d3.DSVParsedArray<F1Data>
  const dataForSeriesGeneration = rawCsvData.filter(d => d.year >= props.yearRange[0] && d.year <= props.yearRange[1]);

  // const margin = { top: 20, right: 100, bottom: 30, left: 50 }
  const margin = { top: 20, right: 150, bottom: 30, left: 50 } // Increased right margin for second Y axis
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
  if (props.teamNameList && props.teamNameList.length > 0) {
    filteredSeries = filteredSeries
      .filter(s => props.teamNameList!.includes(s.name));
  }

  if (props.lineType) {
    filteredSeries = filteredSeries.filter(s => s.type === props.lineType);
  }
  filteredSeries = filteredSeries.filter(s => s.values.length > 0);

  // const y = d3.scaleLinear() // Removed old single y-scale
  //   .domain([0, d3.max(filteredSeries, s => d3.max(s.values, v => v.value)) ?? 0])
  //   .nice()
  //   .range([height - margin.bottom, margin.top])

  // Define separate Y scales for Melbourne (left) and AllCircuits (right)
  const melbourneSeriesForDomain = baseSeries.filter(s => s.type === 'Melbourne' && s.values.length > 0);
  const allCircuitsSeriesForDomain = baseSeries.filter(s => s.type === 'AllCircuits' && s.values.length > 0);

  const originalMaxMelbourne = d3.max(melbourneSeriesForDomain, s => d3.max(s.values, v => v.value)) ?? 0; // Use actual max for Melbourne data
  const maxAllCircuits = d3.max(allCircuitsSeriesForDomain, s => d3.max(s.values, v => v.value)) ?? 0;

  const yMelbourne = d3.scaleLinear()
    .domain([0, originalMaxMelbourne > 0 ? originalMaxMelbourne : 1]) // Use actual Melbourne data max for the scale
    .nice()
    .range([height - margin.bottom, margin.top]);

  const yAllCircuits = d3.scaleLinear()
    .domain([0, maxAllCircuits > 0 ? maxAllCircuits : 1]) // Ensure domain is not [0,0]
    .nice()
    .range([height - margin.bottom, margin.top]);

  // const line = d3.line<{ year: number, value: number }>() // Line generator will be created dynamically
  //   .x(d => x(d.year) as number)
  //   .y(d => y(d.value) as number) // Old y
  //   .curve(d3.curveStep)

  const colors = d3.scaleOrdinal<string>()
    .domain(teamList.map(t => t.name))
    .range(teamList.map(t => t.color))

  xAxisGroup
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .transition()
    .duration(200)
    .call(d3.axisBottom(x)
      .tickValues(x.ticks().filter(tick => Number.isInteger(Number(tick))))
      .tickFormat(d3.format('d'))
    );

  // yAxisGroup // Old yAxisGroup update
  //   .attr('transform', `translate(${margin.left},0)`)
  //   .transition()
  //   .duration(200)
  //   .call(d3.axisLeft(y));

  // Left Y Axis (Melbourne)
  yAxisGroupLeft
    .attr('transform', `translate(${margin.left},0)`)
    .transition()
    .duration(200)
    .call(d3.axisLeft(yMelbourne)
      .tickFormat(d => String(Number(d) / 20)));

  yAxisGroupLeft.selectAll('.axis-title').remove();
  yAxisGroupLeft.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - margin.left + 15)
    .attr('x', 0 - (height - margin.top - margin.bottom) / 2 - margin.top)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'currentColor')
    .text('Points (Melbourne)');

  // Right Y Axis (All Circuits)
  yAxisGroupRight
    .attr('transform', `translate(${width - margin.right},0)`)
    .transition()
    .duration(200)
    .call(d3.axisRight(yAllCircuits));

  yAxisGroupRight.selectAll('.axis-title').remove();
  yAxisGroupRight.append('text')
    .attr('class', 'axis-title')
    .attr('transform', 'rotate(-90)')
    .attr('y', 45)
    .attr('x', 0 - (height - margin.top - margin.bottom) / 2 - margin.top)
    .attr('dy', '1em')
    .style('text-anchor', 'middle')
    .style('fill', 'currentColor')
    .text('Points (All Circuits)');

  const highlightData: HighlightBlock[] = [
    { teamName: 'Ferrari', startYear: 2017, endYear: 2019 }
  ];

  if (highlightBlocksGroup) {
    highlightBlocksGroup.selectAll<SVGRectElement, HighlightBlock>('.highlight-block')
      .data(highlightData, d => `${d.teamName}-${d.startYear}-${d.endYear}`)
      .join(
        enter => enter.append('rect')
          .attr('class', 'highlight-block')
          .attr('x', d => x(d.startYear))
          .attr('y', margin.top)
          .attr('width', d => x(d.endYear) - x(d.startYear))
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', d => d.color || 'lightgray')
          .on('click', (event, d) => {
            console.log('Clicked on highlight block:', d);
            alert(`Clicked on ${d.teamName} from ${d.startYear} to ${d.endYear}`);
          })
          .attr('opacity', 0)
          .call(s => s.transition().duration(300).attr('opacity', 0.5)),
        update => update
          .call(s => s.transition().duration(200)
            .attr('x', d => x(d.startYear))
            .attr('y', margin.top)
            .attr('width', d => x(d.endYear) - x(d.startYear))
            .attr('height', height - margin.top - margin.bottom)
            .attr('fill', d => d.color || 'lightgray')
            .attr('opacity', 0.5)
          ),
        exit => exit
          .call(s => s.transition().duration(200)
            .attr('opacity', 0)
            .remove()
          )
      );
  }

  linesGroup.selectAll<SVGPathElement, { name: string; type: string; values: { year: number; value: number }[] }>('.line')
    .data(filteredSeries, d => `${d.name}_${d.type}`)
    .join(
      enter => enter.append('path')
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke-width', 2)
        .attr('stroke', d => colors(d.name))
        .attr('d', d => {
          const currentYScale = d.type === 'Melbourne' ? yMelbourne : yAllCircuits;
          if (!d.values || d.values.length === 0) return null;
          const linePath = d3.line<{ year: number, value: number }>()
            .x(val => x(val.year) as number)
            .y(val => currentYScale(val.value) as number)
            .curve(d3.curveStep);
          return linePath(d.values);
        })
        .each(function() { // Prepare for animation
          const path = this as SVGPathElement;
          if (path.getAttribute('d')) { // Only animate if path has actual drawing commands
            const length = path.getTotalLength();
            d3.select(path)
              .attr('stroke-dasharray', `${length} ${length}`)
              .attr('stroke-dashoffset', length)
              .attr('opacity', 1); // Make visible for animation start
          } else {
            d3.select(path).attr('opacity', 0); // Hide if no data to draw
          }
        })
        .call(selection =>
          selection.filter(function() { // Filter again to ensure only paths with 'd' are transitioned
            return (this as SVGPathElement).getAttribute('d') !== null;
          })
          .transition()
          .duration(1000) // Animation duration: 1 second
          .ease(d3.easeLinear)
          .attr('stroke-dashoffset', 0)
          .on('end', function(d_on_end) { // d_on_end is the datum bound to the element
            const seriesData = d_on_end as { type: string; name: string; values: { year: number; value: number }[] };
            d3.select(this as SVGPathElement)
              .attr('stroke-dasharray', seriesData.type === 'AllCircuits' ? '5,5' : null); // Set final dash style
          })
        ),
      update => update
        .call(s => s.transition().duration(200)
          .attr('stroke', d => colors(d.name))
          .attr('d', d => {
            const currentYScale = d.type === 'Melbourne' ? yMelbourne : yAllCircuits;
            if (!d.values || d.values.length === 0) return null;
            const linePath = d3.line<{ year: number, value: number }>()
              .x(val => x(val.year) as number)
              .y(val => currentYScale(val.value) as number)
              .curve(d3.curveStep);
            return linePath(d.values);
          })
          .attr('opacity', d => (d.values && d.values.length > 0 ? 1 : 0))
          .attr('stroke-dasharray', d => d.type === 'AllCircuits' ? '5,5' : null) // Set final dash style directly
          .attr('stroke-dashoffset', 0) // Ensure no leftover offset from potential previous states
        ),
      exit => exit
        .call(s => s.transition().duration(200)
          .attr('opacity', 0)
          .remove()
        )
    );

  // const displayedTeamNames = [...new Set(filteredSeries.map(s => s.name))];
  // legendGroup.selectAll<SVGTextElement, string>('.legend-item')
  //   .data(displayedTeamNames, d => d) // Key function for object constancy
  //   .join(
  //     enter => enter.append('text')
  //       .attr('class', 'legend-item')
  //       .style('font-weight', 'bold')
  //       .attr('fill', d => colors(d))
  //       .attr('x', width - margin.right + 10)
  //       .attr('y', (d, i) => margin.top + i * 20)
  //       .text(d => d)
  //       .attr('opacity', 0)
  //       .call(s => s.transition().duration(200).attr('opacity', 1)),
  //     update => update
  //       .call(s => s.transition().duration(200)
  //         .attr('fill', d => colors(d))
  //         .attr('x', width - margin.right + 10)
  //         .attr('y', (d, i) => margin.top + i * 20)
  //         .text(d => d) // Text itself usually doesn't change for legend items if names are stable
  //       ),
  //     exit => exit
  //       .call(s => s.transition().duration(200)
  //         .attr('opacity', 0)
  //         .remove()
  //       )
  //   );
}

onMounted(() => {
  if (!chartContainer.value) return;

  svgSelection = d3.select(chartContainer.value).append('svg');
  xAxisGroup = svgSelection.append('g').attr('class', 'x-axis');
  yAxisGroupLeft = svgSelection.append('g').attr('class', 'y-axis y-axis-left');
  yAxisGroupRight = svgSelection.append('g').attr('class', 'y-axis y-axis-right');
  highlightBlocksGroup = svgSelection.append('g').attr('class', 'highlight-blocks-group'); // Add before lines
  linesGroup = svgSelection.append('g').attr('class', 'lines-group');
  legendGroup = svgSelection.append('g').attr('class', 'legend-group');

  drawChart(); // Initial draw

  watch(
    [() => props.lineType, () => props.teamNameList, () => props.yearRange, () => chartContainerSize.width, () => windowSize.height],
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
