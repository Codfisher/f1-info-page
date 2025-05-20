let selectedLabel = null;

function bindRadarLabels(data) {
	const radarWrappers = d3.selectAll(".radarWrapper");

	// Add one label + line per radarWrapper
	radarWrappers.each(function(d, i) {
		const group = d3.select(this);
		group.attr("data-name", data[i].name); // tag with race name

		const labelGroup = group.append("g").attr("class", "hoverLabel");

		labelGroup.append("line")
			.attr("class", "labelLine")
			.style("stroke", "#999")
			.style("stroke-width", 1)
			.style("opacity", 0);

		labelGroup.append("text")
			.attr("class", "labelText")
			.style("font-size", "12px")
			.style("fill", "#333")
			.style("text-anchor", "middle")
			.style("opacity", 0);
	});

	// Hover interaction
	radarWrappers
		.on("mousemove", function(d, i) {
			const name = data[i].name;
			const values = d;
			const angle = Math.PI * 2 / values.length;
			const midIndex = Math.floor(values.length / 2);

			const radius = 150; // update if needed
			const maxVal = 50;  // update if needed
			const r = d3.scale.linear().range([0, radius]).domain([0, maxVal]);

			const x = r(values[midIndex].value) * Math.cos(angle * midIndex - Math.PI / 2);
			const y = r(values[midIndex].value) * Math.sin(angle * midIndex - Math.PI / 2);

			const labelGroup = d3.select(this).select(".hoverLabel");

			labelGroup.select(".labelLine")
				.attr("x1", x)
				.attr("y1", y)
				.attr("x2", x + 40)
				.attr("y2", y - 45)
				.style("opacity", 1);

			labelGroup.select(".labelText")
				.attr("x", x + 40)
				.attr("y", y - 45)
				.text(name)
				.style("opacity", 1);
		})
		.on("mouseout", function(d, i) {
			if (data[i].name !== selectedLabel) {
				d3.select(this).select(".hoverLabel").selectAll("line, text")
					.transition().duration(200)
					.style("opacity", 0);
			}
		})
		.on("click", function(d, i) {
			selectedLabel = data[i].name;

			// Hide all labels
			d3.selectAll(".hoverLabel").selectAll("line, text")
				.style("opacity", 0);

			// Keep the selected one visible
			d3.select(this).select(".hoverLabel").selectAll("line, text")
				.style("opacity", 1);

			// Trigger popup + highlight logic
			showRadarPopup(data[i].name, data[i].values);
			updateRadarHighlightByName(data[i].name);
		});
}

function updateRadarHighlightByName(selectedName) {
	d3.selectAll(".radarWrapper").each(function() {
		const name = d3.select(this).attr("data-name");
		d3.select(this).select(".radarArea")
			.transition().duration(200)
			.style("fill-opacity", name === selectedName ? 0.7 : 0.1);
	});
}
