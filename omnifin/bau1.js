
function loadMoreRows(t, recs, headers) {
	let irow = arrChildren(t).length - 1; // assumes headers shown!
	let n = 50;
	for (const rec of arrTake(recs, n, irow)) {
		// r = mTableRow(t, rec, info.headers, rid);
		let r = mDom(t, {}, { tag: 'tr' });
		let icol = 0;
		for (const k of headers) {
			let c = mDom(r, {}, { tag: 'td', irow, icol, html: rec[k] });

			icol++;
		}
		irow++;
	}
	//console.log(t)

}
function showRecords(q, dParent, info={}){

	//info may contain: records,headers,sorting=dict per header,header
	let records = valf(info.records,dbToList(qTTList()));

	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });
	if (records.length == 0) return;

	let headers = valf(info.headers,Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header,headers[0]);
	let sorting = valf(info.sorting,{});
	let sortCur = sorting[header];
	let sortDir = sortCur == 'asc'?'desc':'asc';
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);
	console.log('showRecords',header,sortDir)
	sorting[header]=sortDir;

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x, sortDir:x == header?sortDir:null }));

	let infoNew = {records,headers,header,sorting};
	console.log('showRecords_sorting:',infoNew.header,infoNew.sorting[header]);
	headersOnClickSort(t,q,dParent,infoNew);

	tCont.onscroll= () => ifCloseToBottomLoadMoreRecords(tCont,t,records,headers);

	loadMoreRows(t, records, headers);


}
function headersOnClickSort(t,q,dParent,info){
	let headeruis = Array.from(t.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => {
			evNoBubble(ev);
			info.header = firstWord(ui.innerHTML,true); 
			showRecords(q, dParent, info);
		}
	}
}

function showRecords2(q,dParent,headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	console.log('showRecords',header,sortDir)

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x, sortDir:x == header?sortDir:null }));
	headersOnClickSort(t,...arguments);

	tCont.onscroll= () => ifCloseToBottomLoadMoreRecords(tCont,t,records,headers);

	loadMoreRows(t, records, headers);

}
function  ifCloseToBottomLoadMoreRecords(tCont,t,records,headers){
	console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		loadMoreRows(t, records, headers);
	}
}
function _showRecords(q, dParent, headers, header, sortDir = 'asc') {
	onresize = null;

	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });

		ui.onclick = (ev) => {
			evNoBubble(ev);
			let currentDir = DA.tinfo.sortDir;

			let text = firstWord(ui.innerHTML); console.log(text)
			let currentHeader = DA.tinfo.header;
			let sortDir = currentHeader == text ? currentDir == 'asc' ? 'desc' : 'asc' : 'asc';
			showRecords(q, dParent, headers, text, sortDir);
		}
	}
	addSumAmount(headeruis.find(x => x.innerHTML == 'amount'), records);
	if (tablename != 'transactions') return;
	let cells = DA.cells = [];
	for (const ri of t.rowItems) {
		let r = iDiv(ri);
		//console.log(r,arrChildren(r)); break;
		//let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
		let tds = arrChildren(r);
		for (const ui of tds) {
			let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowItems.indexOf(ri), icol: tds.indexOf(ui) };
			item.header = headers[item.icol];
			cells.push(item);
			let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
			mStyle(ui, { cursor: 'pointer' });
			if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
			ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo = { sortDir, records, headers, header, div: dParent, q, tablename };
	checkButtons();
	resizeMain('dNav', dParent, dTitle, dTable);
	onresize = () => resizeMain('dNav', dParent, dTitle, dTable);
	// let h=calcHeightLeftUnder(dTitle)-14;console.log(h)
	// mStyle(dTable,{h})
}
function resizeMain(dNav, dParent, dTitle, dTable) {
	dNav = toElem(dNav);
	let [hNav, hParent, hTitle, hTable, hWin] = [mGetStyle(dNav, 'h'), mGetStyle(dParent, 'h'), mGetStyle(dTitle, 'h'), mGetStyle(dTable, 'h'), window.innerHeight];
	console.log(hNav, hParent, hTitle, hTable, hWin);
	let [maxParent, maxTable] = [hWin - hNav, hWin - hNav - hTitle - 20];

	mStyle('dPage', { padding: 0, h: maxParent, hmax: maxParent, overy: 'hidden', bg: '#eee' });
	mStyle(dParent, { padding: 0, h: maxParent, hmax: maxParent, overy: 'hidden', bg: '#eee' });
	mStyle(dTable, { h: maxTable, bg: '#eee' });
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
	addSumAmount(headeruis.find(x => x.innerHTML == 'amount'), o.records);
	if (tablename != 'transactions') return;
	DA.tinfo.ifrom = ifrom;
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
			ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}

