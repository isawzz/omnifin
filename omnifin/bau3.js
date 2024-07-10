async function onclickSort(ev) { await sortRecords(); }
async function onclickSortFast(ev) { await sortRecords(null, false); }
async function sortRecords(headerlist, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header]

	if (nundef(headerlist)) {
		let cells = DA.cells;
		let selitems = cells.filter(x=>x.isSelected); console.log(selitems);
		headerlist = selitems.map(x=>x.header);
	}
	assertion(!isEmpty(headerlist),'sortRecords with empty headerlist!!!');

	let content = headerlist;//selitems.map(x => ({ name: x, value: false }));
	let result = await mGather(null, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}
async function uiTypeSortForm(d, resolve){
	//was will ich von der sort form? reihenfolge der headers, up/down sort, 
	let handler = () => resolve(getCheckedNames(ui));
	mButton('done', handler, dOuter, { classes: 'input', margin: 10 });
	}


function showChunkedSortedBy(dParent, title, tablename, records, headers, header) {
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header = headers[0];

	if (isList(header)) DA.sortedBy = null; //ist multi-sorted!
	else if (DA.sortedBy == header) { records = sortByEmptyLast(records, header); DA.sortedBy = null; }
	else { records = sortByDescending(records, header); DA.sortedBy = header; }

	mClear(dParent);
	let db = mDom(dParent, { gap: 10, mabottom: 10, className: 'centerflexV' }); //mCenterCenterFlex(db);

	mText(`${tablename} (${records.length})`, db, { weight: 'bold', fz: 20, maleft: 12 });
	// mButton('fifast', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	// mButton('filter', onclickFilter, db, {}, 'button', 'bFilter');
	// mButton('back', onclickBackHistory, db, {}, 'button', 'bBack');
	// mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	// mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	// mButton('multi-sort', onclickMultiSort, db, {}, 'button', 'bMultiSort');
	// // mButton('filter1', onclickFilter1, db, {}, 'button','bFilter1');
	// // mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');
	// mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');
	let dTable = mDom(dParent)
	DA.tinfo = {};
	// if (nundef(masterRecords)) masterRecords = records;
	addKeys({ q: DA.qCurrent, dParent, title, tablename, dTable, records, headers, header, ifrom: 0, size: 100 }, DA.tinfo);
	showChunk(0);
}
function showChunk(inc) {
	let o = DA.tinfo;
	let [dParent, title, tablename, dTable, records, headers, header] = [o.dParent, o.title, o.tablename, o.dTable, o.records, o.headers, o.header];
	let [ifrom, ito] = calcIndexFromTo(inc, o); //console.log(ifrom,ito)
	let chunkRecords = records.slice(ifrom, ito);
	if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dTable);
	let t = UI.dataTable = mDataTable(chunkRecords, dTable, null, headers, 'records');
	if (nundef(t)) { console.log('UI.dataTable is NULL'); return; }
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => { evNoBubble(ev); showChunkedSortedBy(dParent, title, tablename, records, headers, ui.innerHTML); }
	}
	if (tablename != 'transactions') return;
	DA.tinfo.ifrom = ifrom;
	// return;
	let cells = DA.cells = [];
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		//console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		let tds = arrChildren(r);
		for (const ui of tds) {
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowitems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => {toggleItemSelection(item);checkButtons();} //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}











