
function mToggleButton(handler, dParent, styles = {}, opts = {}) {
	let states = opts.states;
	let colors = opts.colors;
	if (nundef(states) && nundef(colors)) { states = ['OFF', 'ON']; }
	const basicColors = ['tomato', 'steel_blue', 'light_green', 'gold', 'orange', 'sienna', 'olive', 'emerald', 'skyblue', 'navy', 'indigo'];
	if (nundef(colors)) { colors = states.map((x, i) => basicColors[i]); }
	if (nundef(states)) { states = colors.map((x, i) => `state ${i + 1}`); }
	let onclick = ev=>{let elem=ev.target;let i=toggleState(elem,states,colors); handler(i);}
	addKeys({className: 'button',align:'center'},styles);
	let b = mDom(dParent,styles,{html:'None',onclick, istate:-1});
	toggleState(b,states,colors);
}
function toggleState(elem,states,colors){
	let i=Number(elem.getAttribute('istate'));
	i++; if (i >= states.length) { i = 0; }
	elem.setAttribute('istate',i)
	elem.textContent = states[i]; 
	mStyle(elem,{bg:colors[i],fg:'contrast'});
	//console.log(elem,i,states,colors,states[i],colors[i])
	return i;
}
function mTableInfinite(recList, dParent, rowStyleFunc, headers, id, showHeaders = true) {
	//console.log(reclist[0])
	if (isEmpty(recList)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(recList[0]);
	let t = mTable(dParent, headers, showHeaders);
	if (isdef(id)) t.id = `t${id}`;
	let rowItems = [];
	return { div: t, recList, rowItems, rowStyleFunc, headers, showHeaders };
}
function mTableAddRows(info,n){
	let i = info.rowItems.length;
	let id = iDiv(info).id;
	for (const u of arrTake(info.recList,n,i)) {
		let rid = isdef(id) ? `r${id}_${i}` : null;
		r = mTableRow(iDiv(info), u, info.headers, rid);
		if (isdef(info.rowStyleFunc)) mStyle(r.div, rowStyleFunc(u));
		info.rowItems.push({ div: r.div, colitems: r.colitems, o: u, id: rid, index: i });
		i++;
	}
}

