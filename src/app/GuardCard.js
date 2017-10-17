class GuardCard {
	constructor(guardNum, guard) {
		this.g = guard;
		this.num = guardNum;
		this.elm = $(`
			<div id="guard-card-${this.num}" class="inmate-card">
				<div class="inmate-card-row">
					<span class="inmate-label">Name</span>
					<input id="guard-name-${this.num}" class="inmate-name-box" type="text" value="${guard[0]}">
				</div>
				<div class="inmate-card-row">
					<span class="inmate-label">Strength</span>
					<input id="guard-str-${this.num}" class="inmate-stats-box" type="number" value="${guard[1]}"></input>
				</div>
				<div class="inmate-card-row">
					<span class="inmate-label">Speed</span>
					<input id="guard-speed-${this.num}" class="inmate-stats-box" type="number" value="${guard[2]}"></input>
				</div>
				<div class="inmate-card-row">
					<span class="inmate-label">Intellect</span>
					<input id="guard-int-${this.num}" class="inmate-stats-box" type="number" value="${guard[3]}"></input>
				</div>
				<div class="inmate-card-row">
					<span class="inmate-label">Opinion</span>
					<input id="guard-opi-${this.num}" class="inmate-stats-box" type="number" value="${guard[4]}"></input>
				</div>
			</div>
		`);
	}
	addTo(parent) {
		$(parent).append(this.elm);
		const me = this;
		$(`#guard-name-${me.num}`).change(e => {
			const num = e.target.id.split('-')[2],
				name = $(e.target).val();
			newSav["Guards"][num][0] = name; // Update name
		});
		$(`#guard-str-${me.num}`).change(e => {
			const num = e.target.id.split('-')[2],
				str = $(e.target).val();
			newSav["Guards"][num][1] = str; // Update strength
		});
		$(`#guard-speed-${me.num}`).change(e => {
			const num = e.target.id.split('-')[2],
				spd = $(e.target).val();
			newSav["Guards"][num][2] = spd; // Update speed
		});
		$(`#guard-int-${me.num}`).change(e => {
			const num = e.target.id.split('-')[2],
				int = $(e.target).val();
			newSav["Guards"][num][3] = int; // Update intellect
		});
		$(`#guard-opi-${me.num}`).change(e => {
			const num = e.target.id.split('-')[2],
				opi = $(e.target).val();
			newSav["Guards"][num][4] = opi; // Update opinion
		});
	}
}

window.GuardCard = GuardCard;