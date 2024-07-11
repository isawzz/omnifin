
function uiGadgetTypeFreeForm(dParent, content, resolve, styles = {}, opts = {}) {
	addKeys({ hmax: 500, wmax: 200, bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let innerStyles = { hmax, wmax, box: true };
	let d = mDom(dOuter, innerStyles, opts);
	content.func(d, content.data, resolve);
	return dOuter;
}
function _mToggleButton(offstate, onstate, handler, dParent, styles = {}, opts = {}) {

	let d = mDom(dParent, { fz: 20 });
	mAppend(d, mSwitch(offstate, onstate));


	// addKeys({state:'off'},opts); //which is initial state
	// //let dbotswitch = mDom(dParent, { align: 'right', patop: 10, gap: 6 }, { html: offstate }); mFlexLine(dbotswitch, 'end')


	// let d=mDom(dParent,{className:'centerFlexV'});
	// mDom(d,{},{html:offstate})

	// let oSwitch = mSwitch(d, {}, { id: 'bot', val:''});// amIHuman(table) ? '' : 'checked' });
	// let inp = oSwitch.inp;
	// oSwitch.inp.onchange = handler;
	// for(const x of arrChildren(dParent)) console.log(x);

	// let div=d.firstChild; console.log(div)
	// mStyle(div,{display:'inline'});
	// //let sw=div.firstChild;
	// //mAppend(dParent,sw);
	// //mRemove(div);
	// //return sw;

}

function onToggleState(ev, states, colors) {
	let elem = ev.target;
	toggleState(elem,states,colors);
}
function toggleState(elem,states,colors){
	let i=Number(elem.getAttribute('istate'));
	i++; if (i >= states.length) { i = 0; }
	elem.setAttribute('istate',i)
	elem.textContent = states[i]; 
	elem.style.backgroundColor = colors[i]; 
	console.log(elem,i,states,colors,states[i],colors[i])
	return i;
}
function mToggleButton(handler, dParent, styles = {}, opts = {}) {
	let states = opts.states;
	let colors = opts.colors;
	if (nundef(states) && nundef(colors)) { states = ['ON', 'OFF']; }
	const basicColors = ['tomato', 'steel_blue', 'light_green', 'gold', 'orange', 'sienna', 'olive', 'emerald', 'skyblue', 'navy', 'indigo'];
	if (nundef(colors)) { colors = states.map((x, i) => basicColors[i]); }
	if (nundef(states)) { states = colors.map((x, i) => `state ${i + 1}`); }

	let b = mButton('None', ev => handler(toggleState(ev.target,states, colors)), dParent, { className: 'button' },{istate:0});
	toggleState(b,states,colors);

}











