function bindRadarPopup(data) {
	// Listen for blob clicks
	d3.selectAll(".radarWrapper")
		.on("click", function(d, i) {
			const dataset = data[i];
			showRadarPopup(dataset.name, dataset.values);
		});
}

function showRadarPopup(title, values) {
	const imageMap = {
		"Monaco Grand Prix": "images/monaco.jpg",
		"Australian Grand Prix": "images/australia.jpg",
		"German Grand Prix": "images/germany.jpg",
		"Belgian Grand Prix": "images/belgium.jpg",
		"Canadian Grand Prix": "images/canada.jpg"
	};

	const metaDataMap = {
		"Monaco Grand Prix": {
			firstGP: "1950",
			laps: "78",
			length: "3.337 km",
			distance: "260.286 km",
		},
		"Australian Grand Prix": {
			firstGP: "1985",
			laps: "58",
			length: "5.303 km",
			distance: "307.574 km",
		},
		"German Grand Prix": {
			firstGP: "1926",
			laps: "67",
			length: "4.574 km",
			distance: "306.458 km",
		},
		"Belgian Grand Prix": {
			firstGP: "1950",
			laps: "44",
			length: "7.004 km",
			distance: "308.052 km",
		},
		"Canadian Grand Prix": {
			firstGP: "1967",
			laps: "70",
			length: "4.361 km",
			distance: "305.270 km",
		}
	};

	// Update circuit image
	document.getElementById("popupImage").src = imageMap[title] || "images/default.jpg";
	document.getElementById("popupImage").alt = `${title} circuit`;

	// Update popup title
	document.getElementById("popupTitle").textContent = title;

	// Update incident stats (left side)
	document.getElementById("popupContent").innerHTML = values.map(function (d) {
		return `<p><strong>${d.axis}:</strong> ${d.value}</p>`;
	}).join("");

	// Update race metadata (right side)
	const meta = metaDataMap[title];
	if (meta) {
		document.getElementById("popupMeta").innerHTML = `
			<div class="popup-meta">
				<div class="popup-meta-item">
					<div class="popup-meta-title">First Grand Prix</div>
					<div class="popup-meta-value">${meta.firstGP}</div>
				</div>
				<div class="popup-meta-item">
					<div class="popup-meta-title">Number of Laps</div>
					<div class="popup-meta-value">${meta.laps}</div>
				</div>
				<div class="popup-meta-item">
					<div class="popup-meta-title">Circuit Length</div>
					<div class="popup-meta-value">${meta.length}</div>
				</div>
				<div class="popup-meta-item">
					<div class="popup-meta-title">Race Distance</div>
					<div class="popup-meta-value">${meta.distance}</div>
				</div>
			</div>
		`;
	} else {
		document.getElementById("popupMeta").innerHTML = "";
	}
}
