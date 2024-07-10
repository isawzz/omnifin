
function uiGadgetTypeFreeform(dParent, callback, resolve, styles = {}, opts = {}) {
	addKeys({ hmax: 500, wmax: 200, bg: 'white', fg: 'black', padding: 10, rounding: 10, box: true }, styles)
	let dOuter = mDom(dParent, styles);
	let hmax = styles.hmax - 193, wmax = styles.wmax;
	let innerStyles = { hmax, wmax, box: true };
	let d=mDom(dOuter,innerStyles,opts);
	callback(d,resolve);
	return dOuter;
}

function showTableSortedBy(dParent, title, tablename, records, headers, header) {
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header = headers[0];
	console.log('___ show Full Table', Counter++, DA.tinfo);
	console.log(DA.sortedBy, header);

	if (isList(header)) DA.sortedBy = null; //ist multi-sorted!
	else if (DA.sortedBy == header) { sortBy(records, header); DA.sortedBy = null; }
	else { sortByDescending(records, header); DA.sortedBy = header; }
	if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dParent);
	mText(`<h2>${title} (${tablename})</h2>`, dParent, { maleft: 12 })
	let t = UI.dataTable = mDataTable(records, dParent, null, headers, 'records');
	if (nundef(t)) return;
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = () => showTableSortedBy(dParent, title, tablename, records, headers, ui.innerHTML);
	}
	if (tablename != 'transactions') return records;
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	}
}













