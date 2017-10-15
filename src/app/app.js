const {
	remote,
	dialog
} = require('electron');
window.currsav = null; // Current active save
window.selectedTab = null; // Current tab selected
window.newSav = null; // New save tree
console.log('escedit v0.0.1');
// Get the session object from main process
let s = remote.getGlobal("session");
s.on('load', () => {
	console.log('Session has loaded.');
	$("#save-loading").remove(); // Remove "loading" element
	for (var i = 0; i < s.saves.length; ++i) {
		const saveNumber = (i + 1).toString(),
			nameData = s.saves[i].nameContent.tree["Data"],
			pname = nameData["Name"],
			day = nameData["Day"],
			map = nameData["Map"],
			saveElem = $(`
				<div id="save${saveNumber}" class="save">
					Name: <b id="save${saveNumber}-name"></b><br>
					Day <b id="save${saveNumber}">#${day}</b><br>
					Map: <b id="save${saveNumber}">${map}</b><br>
				</div><br>
			`);
		$("#save-list").append(saveElem);
		$(`#save${saveNumber}-name`).text(pname); // To avoid odd XSS issues
		saveElem.hide();
		saveElem.fadeIn(800 + (i * 250));
	}
	$(".save").click(e => {
		let target = e.target,
			saveNum = -1;
		if (isNaN(target.id.charAt(target.id.length - 1))) {
			target = target.parentElement;
		}
		savNum = parseInt(target.id.charAt(target.id.length - 1));
		console.log(`Save number ${savNum} was selected.`);
		const save = s.saves[savNum - 1];
		currsav = save;
		launchEditor();
	});
	$(".panel-selection").click(e => {
		// Change tabs
		let oldTab = selectedTab;
		selectedTab = $("#" + e.target.id.split('-')[1]);
		oldTab.fadeOut(200);
		$(e.target).css("border-bottom", "2px solid #FFF");
		$(e.target).css("color", "#FFF");
		$(e.target).css("font-weight", "bold");
		$("#select-" + oldTab[0].id).css("border-bottom", "");
		$("#select-" + oldTab[0].id).css("color", "#bfbfbf");
		$("#select-" + oldTab[0].id).css("font-weight", "normal");
		setTimeout(() => {
			selectedTab.fadeIn(200);
		}, 210);
	});
	$("#exit").click(e => {
		alert("this button does absolutely nothing right now");
	});
	$("#name-box").on("input", () => { currsav.nameContent.tree["Data"]["Name"] = $("#name-box").val(); });
	$("#day-box").on("input", () => { currsav.nameContent.tree["Data"]["Day"] = $("#day-box").val(); });
	$("#map-box").on("input", () => { currsav.nameContent.tree["Data"]["Map"] = $("#map-box").val(); });

	$("#cash-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][0] = $("#cash-box").val(); });
	$("#hp-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][1] = $("#hp-box").val(); });
	$("#heat-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][2] = $("#heat-box").val(); });
	$("#fat-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][3] = $("#fat-box").val(); });
});
let launchEditor = () => {
	if (!currsav) {
		throw new Error("Current save doesn't exist, something went terribly wrong.");
		return;
	}
	$("#sec-start").fadeOut(300);
	setTimeout(() => {
		$("#sec-edit").fadeIn(400);
	}, 310);
	$("#title").text("escedit - editing save #" + currsav.num);
	$("#title").css("font-size", "250%");
	// The player tab is the default tab
	selectedTab = $("#player");
	selectedTab.fadeIn(200);
	// Create newSav
	newSav = {};
	for (const c in currsav.content.tree) {
		const obj = currsav.content.tree[c];
		newSav[c] = {};
		for (const k in obj) {
			newSav[c][k] = null;
			const val = obj[k];
			if (val instanceof Array) {
				// Clone array
				newSav[c][k] = [];
				for (var i = 0; i < val.length; ++i) {
					newSav[c][k].push(val[i]);
				}
			} else {
				// Clone value
				newSav[c][k] = obj[k];
			}
		}
	}
	// Underline and highlight player tab
	$("#select-player").css("border-bottom", "2px solid #FFF");
	$("#select-player").css("color", "#FFF");
	$("#select-player").css("font-weight", "bold");
	// Fill values in the world panel
	$("#name-box")[0].value = currsav.nameContent.tree["Data"]["Name"];
	$("#day-box")[0].value = currsav.nameContent.tree["Data"]["Day"];
	$("#map-box")[0].value = currsav.nameContent.tree["Data"]["Map"];
	// Fill values in the stats panel
	$("#cash-box")[0].value = newSav["Player"]["Cash_HP_Heat_Fat"][0];
	$("#hp-box")[0].value   = newSav["Player"]["Cash_HP_Heat_Fat"][1];
	$("#heat-box")[0].value = newSav["Player"]["Cash_HP_Heat_Fat"][2];
	$("#fat-box")[0].value  = newSav["Player"]["Cash_HP_Heat_Fat"][3];
}