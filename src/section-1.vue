<template>
  <section id="block1">
    <div class="flex items-center text-white">
      <div class="chart-description">
        <div class="text-3xl">
          Comparative Circuit Analysis: Albert Park’s High Incident Rate Revealed
        </div>

        <p>
          The Albert Park Circuit ranks among Formula 1's most unpredictable track, trailing only
          Monaco in total incidents since 1996. The statistics reveal Albert Park's particular dangers: 51
          collisions demonstrate its overtaking difficulties, 12 spins indicate corner instability, while 19
          accidents expose the consequences of its demanding braking zones and uneven surface.
        </p>
      </div>

      <!-- filter -->
      <div class="border p-4 rounded-lg flex flex-col gap-4">
        <div v-for="item in data">
          <div class="flex items-center gap-2">
            <q-btn
              :style="{ backgroundColor: getColor(item.name) }"
              :label="item.name"
              no-caps
              rounded
              class=" duration-500"
              :class="{ 'opacity-30': currentPrix !== item.name }"
              @click="setCurrentPrix(item.name)"
            ></q-btn>
          </div>
        </div>
      </div>

      <div class="left-panel">
        <div class="radar-wrapper">
          <h4 class="radar-title">Incident Type</h4>
          <div class="radarChart"></div>
        </div>
      </div>
      <div class="right-panel">
        <div id="radarPopup">
          <img
            id="popupImage"
            :src="popupImageSrc"
            :alt="popupImageAlt"
          />
          <h3 id="popupTitle">{{ popupTitle }}</h3>
          <div class="popup-main-info">
            <div
              class="popup-stats-left"
              id="popupContent"
            >
              <p
                v-for="stat in popupStats"
                :key="stat.axis"
              ><strong>{{ stat.axis }}:</strong> {{ stat.value }}</p>
            </div>
            <div
              class="popup-meta-right"
              id="popupMeta"
            >
              <div
                v-if="popupMeta && popupMeta.firstGP"
                class="popup-meta"
              >
                <div class="popup-meta-item">
                  <div class="popup-meta-title">
                    First Grand Prix
                  </div>
                  <div class="popup-meta-value">
                    {{ popupMeta.firstGP || 'N/A' }}
                  </div>
                </div>
                <div class="popup-meta-item">
                  <div class="popup-meta-title">
                    Number of Laps
                  </div>
                  <div class="popup-meta-value">
                    {{ popupMeta.laps || 'N/A' }}
                  </div>
                </div>
                <div class="popup-meta-item">
                  <div class="popup-meta-title">
                    Circuit Length
                  </div>
                  <div class="popup-meta-value">
                    {{ popupMeta.length || 'N/A' }}
                  </div>
                </div>
                <div class="popup-meta-item">
                  <div class="popup-meta-title">
                    Race Distance
                  </div>
                  <div class="popup-meta-value">
                    {{ popupMeta.distance || 'N/A' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'; // Import ref
import * as d3 from 'd3'; // Import D3

// Reactive letiables for popup
const popupImageSrc = ref("/section-1/images/formula1.jpg");
const popupImageAlt = ref("Circuit Image");
const popupTitle = ref("Race Information");
const popupStats = ref([
  { axis: "Accident", value: "–" },
  { axis: "Collision", value: "–" },
  { axis: "Spun Off", value: "–" }
]);
const popupMeta = ref({
  firstGP: "",
  laps: "",
  length: "",
  distance: "",
});

// Data and options (existing)
const margin = { top: 60, right: 60, bottom: 60, left: 60 };
const width = 350;
const height = 350;

const currentPrix = ref('')
function setCurrentPrix(prix) {
  if (currentPrix.value === prix) {
    currentPrix.value = ''
    return
  }
  currentPrix.value = prix
}

const data = [
  {
    name: "Monaco Grand Prix", values: [
      { axis: "Accident", value: 37 },
      { axis: "Collision", value: 40 },
      { axis: "Spun Off", value: 30 }
    ],
    image: "/section-1/images/monaco.jpg",
    meta: {
      firstGP: "1950",
      laps: "78",
      length: "3.337 km",
      distance: "260.286 km",
    }
  },
  {
    name: "Australian Grand Prix", values: [
      { axis: "Accident", value: 19 },
      { axis: "Collision", value: 51 },
      { axis: "Spun Off", value: 12 }
    ],
    image: "/section-1/images/australia.jpg",
    meta: {
      firstGP: "1985",
      laps: "58",
      length: "5.303 km",
      distance: "307.574 km",
    }
  },
  {
    name: "German Grand Prix", values: [
      { axis: "Accident", value: 19 },
      { axis: "Collision", value: 37 },
      { axis: "Spun Off", value: 25 }
    ],
    image: "/section-1/images/germany.jpg",
    meta: {
      firstGP: "1926",
      laps: "67",
      length: "4.574 km",
      distance: "306.458 km",
    }
  },
  {
    name: "Belgian Grand Prix", values: [
      { axis: "Accident", value: 14 },
      { axis: "Collision", value: 40 },
      { axis: "Spun Off", value: 14 }
    ],
    image: "/section-1/images/belgium.jpg",
    meta: {
      firstGP: "1950",
      laps: "44",
      length: "7.004 km",
      distance: "308.052 km",
    }
  },
  {
    name: "Canadian Grand Prix", values: [
      { axis: "Accident", value: 27 },
      { axis: "Collision", value: 29 },
      { axis: "Spun Off", value: 16 }
    ],
    image: "/section-1/images/canada.jpg",
    meta: {
      firstGP: "1967",
      laps: "70",
      length: "4.361 km",
      distance: "305.270 km",
    }
  }
];

const radarChartOptions = {
  w: width,
  h: height,
  margin: margin,
  levels: 5,
  roundStrokes: false, // Changed from true to false
  opacityArea: 0.35,
  labelFactor: 1.25,
  wrapWidth: 60,
  dotRadius: 4,
  opacityCircles: 0.1,
  strokeWidth: 2,
};

// --- Start of extracted JS functions ---

function wrap(text, width) {
  text.each(function () {
    let textNode = d3.select(this),
      words = textNode.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.4, // ems
      y = textNode.attr("y"),
      x = textNode.attr("x"),
      dy = parseFloat(textNode.attr("dy")),
      tspan = textNode.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textNode.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

function getColor(name) {
  const colors = {
    "Monaco Grand Prix": "#e74c3c", "Australian Grand Prix": "#3498db",
    "German Grand Prix": "#2ecc71", "Belgian Grand Prix": "#9b59b6",
    "Canadian Grand Prix": "#f1c40f"
  };
  return colors[name] || "#95a5a6";
}

function RadarChart(id, chartData, options) {
  let cfg = {
    w: 600, margin: { top: 20, right: 20, bottom: 20, left: 20 }, levels: 3, maxValue: 50,
    labelFactor: 1.25, wrapWidth: 60, opacityArea: 0.35, dotRadius: 4, opacityCircles: 0.1,
    strokeWidth: 2, roundStrokes: false, h: 600
  };
  Object.assign(cfg, options);



  let minValue = 15;
  let step = 10;
  let maxDataValue = d3.max(chartData, i => d3.max(i.values, o => o.value));
  let topValue = Math.ceil((Math.max(minValue, maxDataValue) - minValue) / step) * step + minValue;
  let allAxis = chartData[0].values.map(i => i.axis),
    total = allAxis.length,
    radius = Math.min(cfg.w / 2, cfg.h / 2),
    Format = d3.format('.0f'),
    angleSlice = Math.PI * 2 / total;

  let rScale = d3.scaleLinear().range([0, radius]).domain([0, topValue]);

  d3.select(id).select("svg").remove();
  let svg = d3.select(id).append("svg")
    .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
    .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
    .attr("class", "radar" + id.replace('.', ''));
  let g = svg.append("g")
    .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left},${cfg.h / 2 + cfg.margin.top})`);

  let filter = g.append('defs').append('filter').attr('id', 'glow'),
    feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
    feMerge = filter.append('feMerge'),
    feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
    feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  let axisGrid = g.append("g").attr("class", "axisWrapper");
  let levelValues = d3.range(cfg.levels).map(i => minValue + step * i).reverse();

  axisGrid.selectAll(".levels").data(levelValues).enter().append("circle")
    .attr("class", "gridCircle").attr("r", d => rScale(d))
    .style("fill", "#CDCDCD").style("stroke", "#CDCDCD")
    .style("fill-opacity", cfg.opacityCircles).style("filter", "url(#glow)");

  axisGrid.selectAll(".axisLabel").data(levelValues).enter().append("text")
    .attr("class", "axisLabel").attr("x", 4).attr("y", d => -rScale(d))
    .attr("dy", "0.4em").style("font-size", "13px")
    .attr("fill", "white").text(d => Format(d));

  let axis = axisGrid.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
  axis.append("line").attr("x1", 0).attr("y1", 0)
    .attr("x2", (d, i) => rScale(topValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y2", (d, i) => rScale(topValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
    .attr("class", "line").style("stroke", "white").style("stroke-width", "2px");

  axis.append("text").attr("class", "legend").style("font-size", "14px")
    .attr("text-anchor", "middle").attr("dy", "0.35em")
    .attr("x", (d, i) => rScale(topValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("y", (d, i) => rScale(topValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
    .text(d => d).call(wrap, cfg.wrapWidth);

  let radarLine = d3.lineRadial()
    .curve(d3.curveLinearClosed)
    .radius(d => rScale(d.value))
    .angle((d, i) => i * angleSlice);
  if (cfg.roundStrokes) radarLine.curve(d3.curveCardinalClosed);

  let blobWrapper = g.selectAll(".radarWrapper").data(chartData).enter().append("g")
    .attr("class", "radarWrapper");

  blobWrapper.append("path").attr("class", "radarArea")
    .attr("d", d => radarLine(d.values))
    .style("fill", d => getColor(d.name)).style("fill-opacity", cfg.opacityArea)
    .on('mouseover', function () {
      d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0.1);
      d3.select(this).transition().duration(200).style("fill-opacity", 0.7);
    })
    .on('mouseout', function () {
      d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", cfg.opacityArea);
    });

  blobWrapper.append("path").attr("class", "radarStroke")
    .attr("d", d => radarLine(d.values))
    .style("stroke-width", cfg.strokeWidth + "px")
    .style("stroke", d => getColor(d.name)).style("fill", "none").style("filter", "url(#glow)");

  blobWrapper.selectAll(".radarCircle")
    .data(d => d.values.map(val => ({ ...val, name: d.name }))).enter().append("circle")
    .attr("class", "radarCircle").attr("r", cfg.dotRadius)
    .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("fill", d => getColor(d.name)).style("fill-opacity", 0.8);

  let blobCircleWrapper = g.selectAll(".radarCircleWrapper").data(chartData).enter().append("g")
    .attr("class", "radarCircleWrapper");

  blobCircleWrapper.selectAll(".radarInvisibleCircle").data(d => d.values).enter().append("circle")
    .attr("class", "radarInvisibleCircle").attr("r", cfg.dotRadius * 1.5)
    .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
    .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
    .style("fill", "none").style("pointer-events", "all")
    .on("mouseover", function (event, d) {
      let newX = parseFloat(d3.select(this).attr('cx')) - 10;
      let newY = parseFloat(d3.select(this).attr('cy')) - 10;
      tooltip.attr('x', newX).attr('y', newY).text(Format(d.value))
        .transition().duration(200).style('opacity', 1);
    })
    .on("mouseout", function () {
      tooltip.transition().duration(200).style('opacity', 0);
    });
  let tooltip = g.append("text").attr("class", "tooltip").style("opacity", 0);
}

function showRadarPopup(title, values, imagePath, metaDetails) {
  popupImageSrc.value = imagePath || "/section-1/images/formula1.jpg";
  popupImageAlt.value = `${title} circuit`;
  popupTitle.value = title;
  popupStats.value = values.map(d => ({ axis: d.axis, value: d.value }));

  if (metaDetails) {
    popupMeta.value = {
      firstGP: metaDetails.firstGP || 'N/A',
      laps: metaDetails.laps || 'N/A',
      length: metaDetails.length || 'N/A',
      distance: metaDetails.distance || 'N/A',
    };
  } else {
    popupMeta.value = { firstGP: "", laps: "", length: "", distance: "" }; // Clear meta if not provided
  }
}

function bindRadarPopup(chartDataArray) {
  d3.selectAll(".radarWrapper")
    .on("click", function (event, d) { // d is the datum bound to .radarWrapper
      if (d && d.name && d.values && d.image && d.meta) {
        showRadarPopup(d.name, d.values, d.image, d.meta);
      }
    });
}

let selectedLabel = null;

function updateRadarHighlightByName(selectedName) {
  const cfgOpacityArea = radarChartOptions.opacityArea || 0.35;
  d3.selectAll(".radarWrapper").each(function (d_wrapper) {
    const name = d_wrapper.name;
    d3.select(this).select(".radarArea")
      .transition().duration(200)
      .style("fill-opacity", name === selectedName ? 0.7 : cfgOpacityArea);
  });
}

function bindRadarLabels(chartDataArray) {
  const radarWrappers = d3.selectAll(".radarWrapper");

  radarWrappers.each(function (d_wrapper) {
    const group = d3.select(this);
    group.attr("data-name", d_wrapper.name);
    const labelGroup = group.append("g").attr("class", "hoverLabel");
    labelGroup.append("line").attr("class", "labelLine")
      .style("stroke", "#999").style("stroke-width", 1).style("opacity", 0);
    labelGroup.append("text").attr("class", "labelText")
      .style("font-size", "12px").style("fill", "#333")
      .style("text-anchor", "middle").style("opacity", 0);
  });

  radarWrappers
    .on("mousemove", function (event, d_wrapper) {
      const name = d_wrapper.name;
      const values = d_wrapper.values;
      const cfg = radarChartOptions;
      const chartRadius = Math.min(cfg.w / 2, cfg.h / 2);
      const minValue = 15; const step = 10;
      const maxDataValOverall = d3.max(chartDataArray, item => d3.max(item.values, o => o.value));
      const chartTopValue = Math.ceil((Math.max(minValue, maxDataValOverall) - minValue) / step) * step + minValue;
      const rScale = d3.scaleLinear().range([0, chartRadius]).domain([0, chartTopValue]);
      const angleSlice = Math.PI * 2 / values.length;
      const midIndex = Math.floor(values.length / 2);
      if (!values[midIndex]) return;

      const x = rScale(values[midIndex].value) * Math.cos(angleSlice * midIndex - Math.PI / 2);
      const y = rScale(values[midIndex].value) * Math.sin(angleSlice * midIndex - Math.PI / 2);
      const labelGroup = d3.select(this).select(".hoverLabel");
      labelGroup.select(".labelLine").attr("x1", x).attr("y1", y).attr("x2", x + 40).attr("y2", y - 45).style("opacity", 1);
      labelGroup.select(".labelText").attr("x", x + 40).attr("y", y - 45).text(name).style("opacity", 1);
    })
    .on("mouseout", function (event, d_wrapper) {
      if (d_wrapper.name !== selectedLabel) {
        d3.select(this).select(".hoverLabel").selectAll("line, text").transition().duration(200).style("opacity", 0);
      }
    })
    .on("click", function (event, d_wrapper) {
      selectedLabel = d_wrapper.name;
      d3.selectAll(".hoverLabel").selectAll("line, text").style("opacity", 0);
      const labelGroup = d3.select(this).select(".hoverLabel");
      labelGroup.selectAll("line, text").style("opacity", 1);
      showRadarPopup(d_wrapper.name, d_wrapper.values, d_wrapper.image, d_wrapper.meta);
      updateRadarHighlightByName(d_wrapper.name);
    });
}

onMounted(() => {
  RadarChart(".radarChart", data, radarChartOptions);
  bindRadarPopup(data);
  bindRadarLabels(data);
  if (data.length > 0) {
    const firstItem = data[0];
    showRadarPopup(firstItem.name, firstItem.values, firstItem.image, firstItem.meta);
    updateRadarHighlightByName(firstItem.name);
    selectedLabel = firstItem.name;
    // Make the first label visible initially
    const firstRadarWrapper = d3.select(".radarWrapper"); // This will select the first one
    if (!firstRadarWrapper.empty()) {
      const firstLabelGroup = firstRadarWrapper.select(".hoverLabel");
      if (!firstLabelGroup.empty()) {
        // Manually trigger a mousemove-like update for the first label's position
        const d_wrapper = data[0];
        const values = d_wrapper.values;
        const cfg = radarChartOptions;
        const chartRadius = Math.min(cfg.w / 2, cfg.h / 2);
        const minValue = 15; const step = 10;
        const maxDataValOverall = d3.max(data, item => d3.max(item.values, o => o.value));
        const chartTopValue = Math.ceil((Math.max(minValue, maxDataValOverall) - minValue) / step) * step + minValue;
        const rScale = d3.scaleLinear().range([0, chartRadius]).domain([0, chartTopValue]);
        const angleSlice = Math.PI * 2 / values.length;
        const midIndex = Math.floor(values.length / 2);
        if (values[midIndex]) {
          const x = rScale(values[midIndex].value) * Math.cos(angleSlice * midIndex - Math.PI / 2);
          const y = rScale(values[midIndex].value) * Math.sin(angleSlice * midIndex - Math.PI / 2);
          firstLabelGroup.select(".labelLine").attr("x1", x).attr("y1", y).attr("x2", x + 40).attr("y2", y - 45);
          firstLabelGroup.select(".labelText").attr("x", x + 40).attr("y", y - 45).text(d_wrapper.name);
        }
        firstLabelGroup.selectAll("line, text").style("opacity", 1);
      }
    }
  }
});
</script>

<style scoped>
/* Copied from public/section-1/index.html and adapted for Vue component */
/* Ensure Google Fonts 'Open Sans' and 'Raleway' are loaded globally in your Vue project */

section {
  min-height: 100vh;
  padding: 40px;
  box-sizing: border-box;
  font-family: 'Open Sans', sans-serif;
  /* Default font */
}

#block1 {
  display: flex;
  justify-content: center;
  align-items: flex-start;
}


.left-panel {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.radar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.radar-title {
  text-align: center;
  margin-bottom: 10px;
  /* Adjusted from original, ensure it looks good */
  font-family: 'Raleway', sans-serif;
  font-size: 1.2em;
  /* Example size */
  font-weight: 600;
  /* Added for better appearance */
}

.right-panel {
  flex: 1;
  min-width: 300px;
  padding-left: 40px;
  /* Keep padding for spacing */
  display: flex;
  /* align-items: flex-end; /* Original had this, check if still desired */
  flex-direction: column;
  /* To align popup content properly */
  justify-content: flex-start;
  /* Align popup from top */

}

.radarChart {
  width: 100%;
  /* Ensure it takes up wrapper space */
  height: 100%;
  /* Ensure it takes up wrapper space */
}

#radarPopup {
  width: 100%;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  height: auto;
  /* auto height */
  margin-top: 20px;
  /* Spacing from radar chart or title */
}

#popupImage {
  width: 100%;
  object-fit: fit;
  object-position: center;
  border-radius: 6px;
}

#popupTitle {
  text-align: center;
  border-top: 2px solid #ccc;
  padding-top: 10px;
  margin: 15px 0 20px;
  /* Adjusted margin */
  font-size: 20px;
  width: 100%;
  font-family: 'Raleway', sans-serif;
  font-weight: 600;
  /* Added for better appearance */
}

.popup-main-info {
  display: flex;
  width: 100%;
  justify-content: space-between;
  flex-wrap: wrap;
  /* Allow wrapping on smaller screens */
  gap: 20px;
  /* Added gap for better spacing */
}

.popup-stats-left {
  flex: 0 0 160px;
  /* Fixed width for stats */
}

.popup-stats-left p {
  margin: 6px 0;
  font-size: 14px;
  font-family: 'Open Sans', sans-serif;
}

.popup-meta-right {
  flex: 1;
  /* Take remaining space */
  min-width: 200px;
  /* Minimum width before wrapping */
}

.popup-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  /* Responsive grid */
  gap: 16px;
}

.popup-meta-item {
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #999;
}

.popup-meta-title {
  font-size: 13px;
  margin-bottom: 4px;
  font-weight: 500;
  /* Changed from original for consistency */
  font-family: 'Open Sans', sans-serif;
}

.popup-meta-value {
  font-size: 18px;
  font-weight: 700;
  font-family: 'Open Sans', sans-serif;
}

.popup-meta-item.full-width {
  grid-column: span 2;
  /* This might need adjustment with auto-fit */
}

.chart-description {
  width: 100%;
  margin-bottom: 20px;
  text-align: left;
  font-family: 'Open Sans', sans-serif;
}

.chart-description h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  font-family: 'Raleway', sans-serif;
}

.chart-description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
}
</style>