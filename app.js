// const {
// 	remote,
// 	dialog,
// 	ipcRenderer
// } = require('electron');
const Export = require('./Export');
window.isDurable = require('./lib/isDurable');
window.currsav = null; // Current active save
window.selectedTab = null; // Current tab selected
window.newSav = null; // New save tree
window.invSlots = []; // Array of ItemDropdowns
console.log('escedit v0.0.1');
// Get the session object from main process
let s = remote.getGlobal("session");
s.on('load', () => {
	console.log('Session has loaded.');
	$("#save-loading").remove(); // Remove "loading" element
	for (var i = 0; i < s.saves.length; ++i) {
		const saveNumber = (i + 1).toString(),
			nameData = s.saves[i].nameContent.tree["Data"],
			pname = s.saves[i].content.tree['Player']["Name"],
			day = s.saves[i].content.tree['Prison']["Day"],
			map = s.saves[i].content.tree['Player']["Map"],
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
		// Alert user that we're working on saving
		$("#exit").text("Saving...");
		setTimeout(() => {
			// Export save
			const exp = new Export(currsav.nameContent, newSav, currsav.num, s);
			ipcRenderer.send('export', exp);
		}, 100);
	});
	$("#name-box").on("input", () => { newSav["Player"]["Name"] = $("#name-box").val(); });
	$("#day-box").on("input", () => { newSav["Prison"]["Day"] = $("#day-box").val(); });
	$("#map-box").on("input", () => { newSav["Player"]["Map"] = $("#map-box").val(); });

	$("#cash-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][0] = $("#cash-box").val(); });
	$("#hp-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][1] = $("#hp-box").val(); });
	$("#heat-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][2] = $("#heat-box").val(); });
	$("#fat-box").on("input", () => { newSav["Player"]["Cash_HP_Heat_Fat"][3] = $("#fat-box").val(); });

	$("#str-box").on("input", () => { newSav["Player"]["Stats"][0] = $("#str-box").val(); });
	$("#speed-box").on("input", () => { newSav["Player"]["Stats"][1] = $("#speed-box").val(); });
	$("#int-box").on("input", () => { newSav["Player"]["Stats"][2] = $("#int-box").val(); });
	$("#xcoord").on("input", () => newSav["Player"]['Location'][0] = $("#xcoord").val());
	$("#ycoord").on("input", () => newSav["Player"]['Location'][1] = $("#ycoord").val());
	$("#zcoord").on("input", () => newSav["Player"]['Location'][2] = $("#zcoord").val());
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
	$("#name-box")[0].value = newSav["Player"]["Name"];
	$("#day-box")[0].value = newSav["Prison"]["Day"];
	$("#map-box")[0].value = newSav["Player"]["Map"];
	// Fill values in the stats panel
	$("#cash-box")[0].value = newSav["Player"]["Cash_HP_Heat_Fat"][0];
	$("#hp-box")[0].value   = newSav["Player"]["Cash_HP_Heat_Fat"][1];
	$("#heat-box")[0].value = newSav["Player"]["Cash_HP_Heat_Fat"][2];
	$("#fat-box")[0].value  = newSav["Player"]["Cash_HP_Heat_Fat"][3];
	// Fill values in the base stats panel
	$("#str-box")[0].value = newSav["Player"]["Stats"][0];
	$("#speed-box")[0].value = newSav["Player"]["Stats"][1];
	$("#int-box")[0].value = newSav["Player"]["Stats"][2];
	// Handle inventory dropdowns
	for (var i = 1; i < 8; ++i) {
		var currItem = newSav["Player"]["Inv"][i - 1];
		var dropdown = new ItemDropdown(currItem);
		dropdown.addTo(`#inven-dropdown-${i}`);
		dropdown.elm.change(e => {
			const slotNumber = parseInt(e.target.parentElement.id.split('-')[2]);
			let id = parseInt($(e.target).val());
			if (isDurable(id)) {
				id += "_100"; // Make sure item has 100% durability
			}
			if (id == -1) {
				// Empty slot, change to none
				newSav["Player"]["Inv"][slotNumber - 1] = "";
			} else {
				newSav["Player"]["Inv"][slotNumber - 1] = id.toString();
				// console.log("Changing inventory item " + slotNumber + " to id " + id);
			}
		});
	}
	// Handle equiptment dropdowns
	let currWeapon = newSav["Player"]["Weapon"],
		currOutfit = newSav["Player"]["Outfit"];
	if (currWeapon !== "") currWeapon = currWeapon.split("_")[0];
	if (currOutfit !== "") currOutfit = currOutfit.split("_")[0];
	let weaponDropdown = new ItemDropdown(currWeapon),
		outfitDropdown = new ItemDropdown(currOutfit);
	weaponDropdown.addTo($("#weapon-dropdown"));
	outfitDropdown.addTo($("#outfit-dropdown"));
	weaponDropdown.elm.change(e => {
		const id = parseInt($(e.target).val());
		if (id == -1) newSav["Player"]["Weapon"] = "";
		else {
			const newVal = id + "_-100"; // Assign weapon to 100% durability
			newSav["Player"]["Weapon"] = newVal;
		}
	});
	outfitDropdown.elm.change(e => {
		const id = parseInt($(e.target).val());
		if (id == -1) newSav["Player"]["Outfit"] = "";
		else {
			const newVal = id + "_100"; // Assign outfit to 100% durability
			newSav["Player"]["Outfit"] = newVal;
		}
	});
	// Coordinate boxes
	$("#xcoord").val(newSav["Player"]['Location'][0]);
	$("#ycoord").val(newSav["Player"]['Location'][1]);
	$("#zcoord").val(newSav["Player"]['Location'][2]);
	// Inmate panel
	for (const inmateId in newSav['Inmates']) {
		var card = new InmateCard(inmateId, newSav["Inmates"][inmateId]);
		card.addTo("#inmate-panel");
	}
	// Guard panel
	for (const guardId in newSav['Guards']) {
		var card = new GuardCard(guardId, newSav["Guards"][guardId]);
		card.addTo("#guard-panel");
	}
	// Job tab
	for (const jobName in newSav['Jobs']) {
		const jobValue = newSav['Jobs'][jobName];
		if (jobValue != "0") {
			// 0 means the job doesn't exist in the map
			const jcard = new JobCard(jobName, jobValue);
			jcard.addTo("#job-cards");
		}
	}
	// Desks tab
	if (window.initDeskTab) {
		window.initDeskTab();
	} else {
		console.warn("window.initDeskTab is not present. Retrying in 200ms...");
		setTimeout(() => {
			window.initDeskTab();
		}, 200);
	}
}
ipcRenderer.on('writeFinish', () => {
	// Ready to exit
	alert("Successfully modified save file.");
	$("#exit").text("Save");
});