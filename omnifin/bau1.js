
function mToggleButton(caption,handler, dParent, styles = {}, opts = {}) {
  let states = opts.states;
  let colors = opts.colors;
  if (nundef(states) && nundef(colors)) { states = ['OFF', 'ON']; }
  const basicColors = ['tomato', 'steel_blue', 'light_green', 'gold', 'orange', 'sienna', 'olive', 'emerald', 'skyblue', 'navy', 'indigo'];
  if (nundef(colors)) { colors = states.map((x, i) => basicColors[i]); }
  if (nundef(states)) { states = colors.map((x, i) => `state ${i + 1}`); }

	let istate=caption?states.indexOf(caption)-1:-1;
	let onclick = ev => { let elem = ev.target; let i = toggleState(elem, states, colors); if (handler) handler(i); }
  addKeys({ className: 'button', align: 'center' }, styles);
	addKeys({html: 'None', onclick, istate} ,opts)
	let b = mDom(dParent, styles, opts);
  toggleState(b, states, colors);
}



