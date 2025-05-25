<template>
  <section id="block1">
    <div class="flex items-center text-white">
      <div class="chart-description">
        <div class="text-3xl text-center py-4">
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
          <div class="flex gap-2">
            <q-btn
              :style="{ backgroundColor: getColor(item.name) }"
              :label="item.name"
              no-caps
              rounded
              class=" duration-500 flex-1"
              :class="{ 'opacity-30': !currentPrix.includes(item.name) && currentPrix.length > 0 }"
              @click="setCurrentPrix(item)"
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
      <div class="right-panel h-[80vh]">
        <div id="radarPopup">
          <img
            id="popupImage"
            :src="popupImageSrc"
            :alt="popupImageAlt"
          />
          <h3 id="popupTitle">{{ popupTitle }}</h3>
          <div class="popup-main-info">
            <div
              class="popup-stats-left border p-4 rounded-lg flex flex-col items-center justify-center"
              id="popupContent"
            >
              <p
                v-for="stat in popupStats"
                :key="stat.axis"
                class="text-nowrap"
              >
                               {{ stat.axis }}: {{ stat.value }}
              </p>
            </div>
            <div
              class="popup-meta-right"
              id="popupMeta"
            >
              <div
                v-if="popupMeta && popupMeta.firstGP"
                class=" grid grid-cols-2 gap-4"
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

const data = [
  {
    name: "Monaco Grand Prix", values: [
      { axis: "Accident", value: 37 },
      { axis: "Collision", value: 40 },
      { axis: "Spun Off", value: 30 }
    ],
    image: "section-1/images/monaco.jpg",
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
    image: "section-1/images/australia.jpg",
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
    image: "section-1/images/germany.jpg",
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
    image: "section-1/images/belgium.jpg",
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
    image: "section-1/images/canada.jpg",
    meta: {
      firstGP: "1967",
      laps: "70",
      length: "4.361 km",
      distance: "305.270 km",
    }
  }
];

// Reactive letiables for popup
const popupImageSrc = ref("section-1/images/formula1.jpg");
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

// --- Start of D3 chart variables ---
let svgInitialized = false;
let g, rScale, angleSlice, radarLine, allAxis, total, radius, Format;
const fullDataset = data; // Reference to the complete dataset for consistent scaling
// --- End of D3 chart variables ---

// Data and options (existing)
const margin = { top: 60, right: 60, bottom: 60, left: 60 };
const width = 350;
const height = 350;

const currentPrix = ref([]); // 改為字串陣列

function showPersistentLabel(prixName) { // Removed chartDataForScale, will use global rScale
  d3.selectAll(".hoverLabel").selectAll("line, text").style("opacity", 0);

  if (!prixName || !rScale || !g || total === 0) return; // Check for D3 elements and total axes

  const targetWrapper = g.select(`.radarWrapper[data-name="${prixName}"]`);
  if (targetWrapper.empty()) return;

  const d_wrapper = targetWrapper.datum();
  if (!d_wrapper || !d_wrapper.values) return;

  const labelGroup = targetWrapper.select(".hoverLabel");
  if (labelGroup.empty()) return;

  const values = d_wrapper.values;
  // const cfg = radarChartOptions; // cfg is available via radarChartOptions
  // const chartRadius = Math.min(radarChartOptions.w / 2, radarChartOptions.h / 2); // This is global `radius`

  // Use global angleSlice based on total number of axes
  const midIndex = Math.floor(values.length / 2); // This is specific to the item's data structure

  if (values[midIndex] && values[midIndex].value !== undefined) {
    const x = rScale(values[midIndex].value) * Math.cos(angleSlice * midIndex - Math.PI / 2);
    const y = rScale(values[midIndex].value) * Math.sin(angleSlice * midIndex - Math.PI / 2);
    labelGroup.select(".labelLine").attr("x1", x).attr("y1", y).attr("x2", x + 40).attr("y2", y - 45);
    labelGroup.select(".labelText").attr("x", x + 40).attr("y", y - 45).text(d_wrapper.name);
    labelGroup.selectAll("line, text").style("opacity", 1);
  }
}

function setCurrentPrix(datum) {
  const prixName = datum.name;
  const index = currentPrix.value.indexOf(prixName);

  if (index > -1) {
    // 如果已選擇，則取消選擇
    currentPrix.value.splice(index, 1);
  } else {
    // 如果未選擇，則加入選擇
    currentPrix.value.push(prixName);
  }

  if (currentPrix.value.length === 0) {
    // 沒有選擇任何項目，顯示所有數據
    RadarChart(".radarChart", data, radarChartOptions);
    bindRadarLabels();
    // 預設顯示 Australian Grand Prix 的詳細資訊
    const australianGP = data.find(d => d.name === "Australian Grand Prix");
    if (australianGP) {
      showRadarPopup(australianGP.name, australianGP.values, australianGP.image, australianGP.meta);
      updateRadarHighlightByName(null); // 清除高亮
      showPersistentLabel(null); // 清除固定標籤
      selectedLabel = null;
    }
  } else if (currentPrix.value.length === 1) {
    // 顯示單選的資料
    const selectedDatum = data.find(d => d.name === currentPrix.value[0]);
    if (selectedDatum) {
      RadarChart(".radarChart", [selectedDatum], radarChartOptions);
      bindRadarLabels();
      showRadarPopup(selectedDatum.name, selectedDatum.values, selectedDatum.image, selectedDatum.meta);
      updateRadarHighlightByName(selectedDatum.name);
      showPersistentLabel(selectedDatum.name);
      selectedLabel = selectedDatum.name;
    }
  } else { // currentPrix.value.length >= 2
    // 顯示多選的資料
    const selectedData = data.filter(d => currentPrix.value.includes(d.name));
    RadarChart(".radarChart", selectedData, radarChartOptions);
    bindRadarLabels();
    // 右側顯示 Australian Grand Prix 的詳細資訊
    const australianGP = data.find(d => d.name === "Australian Grand Prix");
    if (australianGP) {
      showRadarPopup(australianGP.name, australianGP.values, australianGP.image, australianGP.meta);
      // 在多選情況下，可能不需要高亮特定一個，或者根據需求調整
      updateRadarHighlightByName(null); // 清除高亮，或根據需求高亮 Australian GP
      showPersistentLabel(null); // 清除固定標籤，或根據需求顯示 Australian GP 的標籤
      selectedLabel = null; // 清除單選標籤狀態
    }
  }
}

const radarChartOptions = {
  w: width,
  h: height,
  margin: margin,
  levels: 5,
  roundStrokes: false,
  opacityArea: 0, // 將此值設為 0，使多邊形不填滿顏色
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
      tspan = textNode
        .text(null)
        .append("tspan")
        .attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = textNode
          .append("tspan")
          .attr("x", x)
          .attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
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
    labelFactor: 1.25, wrapWidth: 60, opacityArea: 0, dotRadius: 4, opacityCircles: 0.1, // 確認此處的 opacityArea 也為 0
    strokeWidth: 2, roundStrokes: false, h: 600
  };
  Object.assign(cfg, options);

  const minValue = 15;
  const step = 10;

  let maxDataValueOverall = d3.max(fullDataset, i => d3.max(i.values, o => o.value)) || minValue;
  let topValue = Math.ceil((Math.max(minValue, maxDataValueOverall) - minValue) / step) * step + minValue;

  if (!svgInitialized) {
    const svgContainer = d3.select(id);
    svgContainer.select("svg").remove();

    const svg = svgContainer.append("svg")
      .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
      .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
      .attr("class", "radar" + id.replace('.', ''));

    g = svg.append("g")
      .attr("transform", `translate(${cfg.w / 2 + cfg.margin.left},${cfg.h / 2 + cfg.margin.top})`);

    let filter = g.append('defs').append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    let feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    allAxis = fullDataset.length > 0 ? fullDataset[0].values.map(i => i.axis) : [];
    total = allAxis.length;
    radius = Math.min(cfg.w / 2, cfg.h / 2);
    Format = d3.format('.0f');
    angleSlice = total > 0 ? Math.PI * 2 / total : 0;

    rScale = d3.scaleLinear().range([0, radius]).domain([0, topValue]);

    let axisGrid = g.append("g").attr("class", "axisWrapper");
    const gridLevels = d3.range(minValue, topValue + step, step).reverse();

    axisGrid.selectAll(".levels").data(gridLevels).enter().append("circle")
      .attr("class", "gridCircle").attr("r", d => rScale(d))
      .style("fill", "#CDCDCD").style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles).style("filter", "url(#glow)");

    axisGrid.selectAll(".axisLabel").data(gridLevels).enter().append("text")
      .attr("class", "axisLabel").attr("x", 4).attr("y", d => -rScale(d))
      .attr("dy", "0.4em").style("font-size", "13px")
      .attr("fill", "white").text(d => Format(d)); // Already white, no change needed

    if (total > 0) {
      let axis = axisGrid.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
      axis.append("line").attr("x1", 0).attr("y1", 0)
        .attr("x2", (d, i) => rScale(topValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y2", (d, i) => rScale(topValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("class", "line").style("stroke", "white").style("stroke-width", "2px");

      axis.append("text").attr("class", "legend").style("font-size", "14px")
        .attr("text-anchor", "middle").attr("dy", "0.35em")
        .attr("x", (d, i) => rScale(topValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("y", (d, i) => rScale(topValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2))
        .text(d => d).call(wrap, cfg.wrapWidth)
        .style("fill", "white"); // Added to ensure legend text is white
    }

    radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => total > 0 ? i * angleSlice : 0);
    if (cfg.roundStrokes) radarLine.curve(d3.curveCardinalClosed);

    g.append("text").attr("class", "tooltip").style("opacity", 0).style("fill", "white"); // Added fill: white for tooltip
    svgInitialized = true;
  } else if (rScale) { // Ensure rScale is available for updates
    rScale.domain([0, topValue]); // Update domain if topValue changed (should be stable with fullDataset)
  }

  if (total === 0 && chartData.length > 0 && chartData[0].values.length > 0) {
    // This case handles if allAxis was not set initially due to empty fullDataset,
    // but now chartData provides axes. This is less likely if fullDataset is properly initialized.
    allAxis = chartData[0].values.map(i => i.axis);
    total = allAxis.length;
    angleSlice = total > 0 ? Math.PI * 2 / total : 0;
    radarLine = d3.lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(d => rScale(d.value))
      .angle((d, i) => total > 0 ? i * angleSlice : 0);
    if (cfg.roundStrokes) radarLine.curve(d3.curveCardinalClosed);
    // Potentially redraw axes here if they were missed, or ensure initial setup is robust.
  }

  if (!rScale || !g || !radarLine || total === 0) return; // Guard against missing D3 essentials

  let blobWrapper = g.selectAll(".radarWrapper")
    .data(chartData, d => d.name);

  blobWrapper.exit()
    .transition().duration(500)
    .style("opacity", 0)
    .selectAll("path")
    .attr("d", d => radarLine(d.values.map(v => ({ ...v, value: 0 }))))
    .remove();
  blobWrapper.exit().selectAll("circle").remove(); // remove circles of exiting blobs
  blobWrapper.exit().remove();


  let blobWrapperEnter = blobWrapper.enter().append("g")
    .attr("class", "radarWrapper")
    .attr("data-name", d => d.name);

  blobWrapperEnter.append("path")
    .attr("class", "radarArea")
    .style("fill", d => getColor(d.name))
    .style("fill-opacity", 0) // Initial for animation
    .attr("d", d => radarLine(d.values.map(v => ({ ...v, value: 0 }))));
  // Removed mouseover and mouseout handlers that changed opacity for .radarArea
  // Original handlers were:
  // .on('mouseover', function (event, d_mouseover) { ... })
  // .on('mouseout', function () { ... });

  blobWrapperEnter.append("path")
    .attr("class", "radarStroke")
    .style("stroke", d => getColor(d.name))
    .style("fill", "none")
    .style("filter", "url(#glow)")
    .style("stroke-width", cfg.strokeWidth + "px")
    .attr("d", d => radarLine(d.values.map(v => ({ ...v, value: 0 }))))
    .style("opacity", 0);

  blobWrapper = blobWrapperEnter.merge(blobWrapper);

  blobWrapper.select(".radarArea")
    .transition().duration(750)
    .attr("d", d => radarLine(d.values))
    .style("fill-opacity", cfg.opacityArea); // 此處會使用上面設定的 opacityArea: 0

  blobWrapper.select(".radarStroke")
    .transition().duration(750)
    .attr("d", d => radarLine(d.values))
    .style("opacity", 1);

  blobWrapper.each(function (prixData) {
    const self = d3.select(this);
    let circles = self.selectAll(".radarCircle")
      .data(prixData.values.map(val => ({ ...val, prixFullName: prixData.name })), d => d.axis);

    circles.exit()
      .transition().duration(500)
      .attr("r", 0)
      .remove();

    let circlesEnter = circles.enter().append("circle")
      .attr("class", "radarCircle")
      .attr("r", 0)
      .attr("cx", (d, i) => rScale(0) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(0) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", d => getColor(d.prixFullName))
      .style("fill-opacity", 0.8);

    circlesEnter.merge(circles)
      .transition().duration(750)
      .attr("r", cfg.dotRadius)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2));
  });

  let blobCircleWrapper = g.selectAll(".radarCircleWrapper")
    .data(chartData, d => d.name);

  blobCircleWrapper.exit()
    .transition().duration(500)
    .style("opacity", 0)
    .remove();

  let blobCircleWrapperEnter = blobCircleWrapper.enter().append("g")
    .attr("class", "radarCircleWrapper");

  blobCircleWrapper = blobCircleWrapperEnter.merge(blobCircleWrapper);
  const tooltip = g.select(".tooltip");

  blobCircleWrapper.each(function (prixData) {
    const self = d3.select(this);

    let invisibleCircles = self.selectAll(".radarInvisibleCircle")
      .data(prixData.values, d => d.axis);

    invisibleCircles.exit()
      .transition().duration(500)
      .attr("r", 0)
      .remove();

    let invisibleCirclesEnter = invisibleCircles.enter().append("circle")
      .attr("class", "radarInvisibleCircle")
      .attr("r", 0)
      .attr("cx", (d, i) => rScale(0) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(0) * Math.sin(angleSlice * i - Math.PI / 2))
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function (event, d_mouseover) {
        if (!Format) return;
        let newX = parseFloat(d3.select(this).attr('cx')) - 10;
        let newY = parseFloat(d3.select(this).attr('cy')) - 10;
        tooltip.attr('x', newX).attr('y', newY).text(Format(d_mouseover.value))
          .transition().duration(200).style('opacity', 1);
      })
      .on("mouseout", function () {
        tooltip.transition().duration(200).style('opacity', 0);
      });

    invisibleCirclesEnter.merge(invisibleCircles)
      .transition().duration(750)
      .attr("r", cfg.dotRadius * 1.5)
      .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2));
  });
}

function showRadarPopup(title, values, imagePath, metaDetails) {
  popupImageSrc.value = imagePath || "section-1/images/formula1.jpg";
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
  if (!g || !radarChartOptions) return;
  g.selectAll(".radarWrapper .radarArea")
    .transition()
    .duration(200)
    .style("fill-opacity", radarChartOptions.opacityArea); //確保高亮時也使用選項中的 opacityArea
}

function bindRadarLabels() { // Removed chartDataArray argument
  if (!g || !rScale || !angleSlice || total === 0) return; // Guard with D3 elements

  const radarWrappers = g.selectAll(".radarWrapper");

  radarWrappers.each(function (d_wrapper) {
    const group = d3.select(this);
    group.attr("data-name", d_wrapper.name);
    let labelGroup = group.select(".hoverLabel");
    if (labelGroup.empty()) {
      labelGroup = group.append("g").attr("class", "hoverLabel");
      labelGroup.append("line").attr("class", "labelLine")
        .style("stroke", "#999").style("stroke-width", 1).style("opacity", 0);
      labelGroup.append("text").attr("class", "labelText")
        .style("font-size", "12px").style("fill", "white") // Changed from #333 to white
        .style("text-anchor", "middle").style("opacity", 0);
    }
  });

  radarWrappers
    .on("mousemove", function (event, d_wrapper) {
      if (d_wrapper.name === selectedLabel || !rScale || !angleSlice || total === 0) return;

      const name = d_wrapper.name;
      const values = d_wrapper.values;
      const midIndex = Math.floor(values.length / 2);
      if (!values[midIndex] || values[midIndex].value === undefined) return;

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
  // 改交給 filter 處理
  // .on("click", function (event, d_wrapper) {
  //   selectedLabel = d_wrapper.name;
  //   d3.selectAll(".hoverLabel").selectAll("line, text").style("opacity", 0);
  //   const labelGroup = d3.select(this).select(".hoverLabel");
  //   labelGroup.selectAll("line, text").style("opacity", 1);
  //   showRadarPopup(d_wrapper.name, d_wrapper.values, d_wrapper.image, d_wrapper.meta);
  //   updateRadarHighlightByName(d_wrapper.name);
  // });
}

onMounted(() => {
  // currentPrix.value = ''; // 初始化為空陣列
  RadarChart(".radarChart", data, radarChartOptions);
  bindRadarLabels(); // Call without argument
  bindRadarPopup(); // Call without argument, assumes it will select .radarWrapper from global 'g' or document

  if (data.length > 0) {
    const australianGP = data.find(d => d.name === "Australian Grand Prix");
    if (australianGP) { // 預設顯示 Australian Grand Prix
      showRadarPopup(australianGP.name, australianGP.values, australianGP.image, australianGP.meta);
      updateRadarHighlightByName(australianGP.name);
      selectedLabel = australianGP.name;
      showPersistentLabel(australianGP.name);
      // 預設情況下，雷達圖顯示所有數據，但右側詳細資訊顯示 Australian Grand Prix
      RadarChart(".radarChart", data, radarChartOptions); // 初始顯示所有
    } else {
      // Fallback if Australian Grand Prix is not found (should not happen with current data)
      const firstItem = data[0];
      showRadarPopup(firstItem.name, firstItem.values, firstItem.image, firstItem.meta);
      updateRadarHighlightByName(firstItem.name);
      selectedLabel = firstItem.name;
      showPersistentLabel(firstItem.name);
      RadarChart(".radarChart", data, radarChartOptions); // 初始顯示所有
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
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
  aspect-ratio: 1320 / 743;
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