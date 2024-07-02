
function showTableSortedBy(dParent, tablename, records, headers, header) {
	if (DA.sortedBy == header) { sortByDescending(records, header); DA.sortedBy = null; }
	else { sortBy(records, header); DA.sortedBy = header; }
	mClear(dParent);
	mText(`<h2>${tablename}</h2>`, dParent, { maleft: 12 })
	let t = UI.tables = mDataTable(records, dParent, null, headers, 'records');
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = () => showTableSortedBy(dParent, tablename, records, headers, ui.innerHTML);
	}
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		let h = hFunc('tag', 'onclickAddTag', id, ri); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	}

}

async function showAnyTable(tablename,res) {
	let records = dbResultToList(res);
	let dParent = mBy('dT');
	if (isdef(dParent)) { mClear(dParent); }
	else dParent = mDom('dMain', {}, { className: 'section', id: 'dT' });
	if (isEmpty(records)) { mText('no records', dParent); return []; }
	let headers = Object.keys(records[0]);
	showTableSortedBy(dParent, tablename, records, headers, headers[0]);
}
