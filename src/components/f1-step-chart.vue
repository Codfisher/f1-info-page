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
import { useQuasar } from 'quasar';
import MarkdownIt from 'markdown-it'; // Import markdown-it

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
  info: string;
}

const $q = useQuasar()
const md = new MarkdownIt(); // Create a new markdown-it instance

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
    {
      teamName: 'Ferrari',
      startYear: 2018,
      endYear: 2019,
      info: `
### 🟩 2018 – Overperformance

**Drivers:**
- Sebastian Vettel – Started P3, Finished P1 (gained lead under Virtual Safety Car)  
- Kimi Räikkönen – Started P2, Finished P3

**Triggering Factor:**  
A well-timed pit stop during a Virtual Safety Car allowed Vettel to jump ahead of Hamilton, despite Ferrari not being the outright fastest. The strategy call overturned expectations and delivered a stronger result than their average season pace.`
    },
    {
      teamName: 'Ferrari',
      startYear: 2023,
      endYear: 2024,
      info: `
### 🟥 2023 – Underperformance

**Drivers:**
- Charles Leclerc – Started P7, DNF (Lap 1 spin after contact)  
- Carlos Sainz – Started P5, Finished P12 (penalised for causing a collision)

**Triggering Factor:**  
Leclerc spun into the gravel following contact with Stroll on the opening lap. A red-flag restart later saw Sainz collide with Alonso, earning a 5-second penalty that dropped him out of the points. A chaotic race nullified Ferrari’s potential.`
    },
    {
      teamName: 'Ferrari',
      startYear: 2024,
      endYear: 2025,
      info: `
### 🟩 2024 – Overperformance

**Drivers:**
- Carlos Sainz – Started P2, Finished P1  
- Charles Leclerc – Started P5, Finished P2

**Triggering Factor:**  
With Verstappen retiring due to a brake issue, Ferrari capitalised with faultless racecraft. The 1–2 finish exceeded expectations for a team not seen as a clear front-runner going into the event.`
    },
    {
      teamName: 'McLaren',
      startYear: 2012,
      endYear: 2013,
      info: `
### 🟩 2012 – Overperformance

**Drivers:**
- Jenson Button – Started P2, Finished P1  
- Lewis Hamilton – Started P1, Finished P3

**Triggering Factor:**  
McLaren executed a strong race with quick pit stops, accurate strategy calls, strong tyre management, and consistent communication between pit wall and drivers. Button and Hamilton took the lead at the start and controlled the pace, while rivals struggled with execution.`
    },
    {
      teamName: 'McLaren',
      startYear: 2014,
      endYear: 2015,
      info: `
### 🟩 2014 – Overperformance

**Drivers:**
- Kevin Magnussen – Started P4, Finished P2  
- Jenson Button – Started P10, Finished P3 (promoted after Ricciardo’s disqualification)

**Triggering Factor:**  
Magnussen impressed on debut, and Button kept consistent pressure. Ricciardo was later disqualified for breaching fuel flow limits, promoting both McLarens to the podium. It was their only such result in a tough season.`
    },
    {
      teamName: 'McLaren',
      startYear: 2019,
      endYear: 2020,
      info: `
### 🟥 2019 – Underperformance

**Drivers:**
- Carlos Sainz – Started P18, DNF (power unit failure)  
- Lando Norris – Started P8, Finished P12

**Triggering Factor:**  
Sainz retired early with an engine fire, while Norris dropped out of the points after a delayed pit stop left him vulnerable to undercuts. He rejoined into traffic and couldn’t recover positions. The team underdelivered despite entering with a competitive package.`
    },
    {
      teamName: 'Mercedes',
      startYear: 2014,
      endYear: 2015,
      info: `
### 🟥 2014 – Underperformance

**Drivers:**
- Nico Rosberg – Started P3, Finished P1  
- Lewis Hamilton – Started P1, DNF (engine misfire on Lap 2)

**Triggering Factor:**  
Hamilton suffered a cylinder failure and retired while running second. Although Rosberg dominated, the early exit denied Mercedes a likely 1–2, falling short of their season’s dominant standards.`
    },
    {
      teamName: 'Mercedes',
      startYear: 2018,
      endYear: 2019,
      info: `
### 🟥 2018 – Underperformance

**Drivers:**
- Lewis Hamilton – Started P1, Finished P2 (lost lead under VSC)  
- Valtteri Bottas – Started P15, Finished P8 (after Q3 crash)

**Triggering Factor:**  
Hamilton lost the race due to a miscalculated Virtual Safety Car pit window. Bottas started from deep in the grid after a crash in qualifying. Tactical and qualifying setbacks reduced their points haul.`
    },
    {
      teamName: 'Mercedes',
      startYear: 2024,
      endYear: 2025,
      info: `
### 🟥 2024 – Underperformance

**Drivers:**
- Lewis Hamilton – Started P11, Finished P10  
- George Russell – Started P7, DNF (crashed while battling Alonso)

**Triggering Factor:**  
Hamilton lacked pace throughout, struggling with instability under braking and rear-end grip loss, which compromised corner entry and exit. Russell retired after losing control while pursuing Alonso in the closing laps.`
    },
    {
      teamName: 'Red Bull',
      startYear: 2010,
      endYear: 2011,
      info: `
### 🟥 2010 – Underperformance

**Drivers:**
- Sebastian Vettel – Started P1, DNF (brake failure from the lead)  
- Mark Webber – Started P2, Finished P9 (collision with Hamilton)

**Triggering Factor:**  
Vettel retired from a dominant position due to front brake failure. Webber collided with Hamilton late in the race while fighting for position, turning a likely double podium into a minimal points result.`
    },
    {
      teamName: 'Red Bull',
      startYear: 2014,
      endYear: 2015,
      info: `
### 🟩 2014 – Overperformance

**Drivers:**
- Daniel Ricciardo – Started P2, Finished P2 (later disqualified)  
- Sebastian Vettel – Started P12, DNF

**Triggering Factor:**  
Ricciardo surprised the paddock with a P2 finish in Red Bull’s struggling RB10 with the new Renault hybrid power unit, though he was later disqualified for a fuel flow violation. The strong showing defied expectations for their early-season form.`
    },
    {
      teamName: 'Red Bull',
      startYear: 2022,
      endYear: 2023,
      info: `
### 🟥 2022 – Underperformance

**Drivers:**
- Sergio Pérez – Started P3, Finished P2  
- Max Verstappen – Started P2, DNF (fuel leak while running second)

**Triggering Factor:**  
Verstappen retired from P2 with a fuel system issue, while Pérez secured a podium. Reliability issues prevented a full points finish for a team that would dominate the remainder of the season.`
    }
  ];


  // Filter highlightData based on selected team
  let currentHighlightData: HighlightBlock[] = [];
  if (props.teamNameList && props.teamNameList.length === 1) {
    const selectedTeam = props.teamNameList[0];
    currentHighlightData = highlightData.filter(block => block.teamName === selectedTeam);
  }

  if (highlightBlocksGroup) {
    highlightBlocksGroup.selectAll<SVGRectElement, HighlightBlock>('.highlight-block')
      .data(currentHighlightData, d => `${d.teamName}-${d.startYear}-${d.endYear}`)
      .join(
        enter => enter.append('rect')
          .attr('class', 'highlight-block')
          .attr('x', d => x(d.startYear - 0.5))
          .attr('y', margin.top)
          .attr('width', d => x(d.endYear) - x(d.startYear))
          .attr('height', height - margin.top - margin.bottom)
          .attr('fill', 'lightgray')
          .on('click', (event, d) => {
            $q.dialog({
              title: `${d.teamName}`,
              message: md.render(d.info), // Convert Markdown to HTML
              html: true,
              ok: false,
            });
          })
          .attr('opacity', 0)
          .call(s => s.transition().duration(300).attr('opacity', 0.5)),
        update => update
          .call(s => s.transition().duration(200)
            .attr('x', d => x(d.startYear))
            .attr('y', margin.top)
            .attr('width', d => x(d.endYear) - x(d.startYear))
            .attr('height', height - margin.top - margin.bottom)
            .attr('fill', 'lightgray')
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
        .each(function () { // Prepare for animation
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
          selection.filter(function () { // Filter again to ensure only paths with 'd' are transitioned
            return (this as SVGPathElement).getAttribute('d') !== null;
          })
            .transition()
            .duration(1000) // Animation duration: 1 second
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .on('end', function (d_on_end) { // d_on_end is the datum bound to the element
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

<style>
.chart-container {
  width: 100%;
  overflow-x: auto;
}

.highlight-block {
  cursor: pointer;
}

strong {
  margin-top: 1rem;
  display: block;
}

ul {
  padding-left: 1.5em;
  margin-top: 0.5em;
  margin-bottom: 0.5em;
  list-style-type: disc;
}

li {
  list-style-type: disc;
  margin-bottom: 0.25em;
  margin-left: 1.5rem;
  line-height: 1.5;
}
</style>
