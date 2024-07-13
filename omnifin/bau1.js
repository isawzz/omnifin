
function showRecords(q,dParent,headers,header,sortDir='asc'){
	onresize = null;
	if (nundef(dParent)) dParent = UI.d; if (nundef(dParent)) return;	
	dParent = toElem(dParent); mClear(dParent); //mStyle(dParent,{scroll:'auto'});
	let records = dbToList(q); //console.log(q)
	if (isEmpty(records)) { mText('no data', dParent); return null; }
	let tablename = dbGetTableName(q); //console.log(tablename);
	if (nundef(headers)) headers = Object.keys(records[0]);
	if (nundef(header)) header=headers[0];
	records = sortDir == 'asc'?sortByEmptyLast(records, header):sortByDescending(records,header);

	let dTitle=mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding:6 });

	let dTable = mDom(dParent);
	let t = UI.dataTable = mTableInfinite(records, dTable, null, headers, 'records');
	
	if (nundef(t)) { console.log('UI.dataTable is NULL'); return; }
	mTableAddRows(t,100);	
	let d = t.div;

	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		
		ui.onclick = (ev) => { 
			evNoBubble(ev); 
			let currentDir=DA.tinfo.sortDir;
			console.log(ui)
			let text = ui.innerHTML;
			let currentHeader = DA.tinfo.header;
			let sortDir = currentHeader == text? currentDir == 'asc'?'desc':'asc':'asc';
			showRecords(q, dParent, headers, ui.innerHTML, sortDir); 
		}
	}
	addSumAmount(headeruis.find(x=>x.innerHTML == 'amount'),records);
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
			ui.onclick = () => {toggleItemSelection(item);checkButtons();} //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo={sortDir,records,headers,header,div:dParent,q,tablename};
	checkButtons();
	resizeMain('dNav',dParent,dTitle,dTable);
	onresize = ()=>resizeMain('dNav',dParent,dTitle,dTable);
	// let h=calcHeightLeftUnder(dTitle)-14;console.log(h)
	// mStyle(dTable,{h})
}
function resizeMain(dNav,dParent,dTitle,dTable){
	dNav = toElem(dNav);
	let [hNav,hParent,hTitle,hTable,hWin]=[mGetStyle(dNav,'h'),mGetStyle(dParent,'h'),mGetStyle(dTitle,'h'),mGetStyle(dTable,'h'),window.innerHeight];
	console.log(hNav,hParent,hTitle,hTable,hWin);
	let [maxParent,maxTable]=[hWin-hNav,hWin-hNav-hTitle-20];

	mStyle('dPage',{padding:0,h:maxParent,hmax:maxParent,overy:'hidden',bg:'#eee'});
	mStyle(dParent,{padding:0,h:maxParent,hmax:maxParent,overy:'hidden',bg:'#eee'});
	mStyle(dTable,{h:maxTable,bg:'#eee'});
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
	addSumAmount(headeruis.find(x=>x.innerHTML == 'amount'),o.records);
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
			ui.onclick = () => {toggleItemSelection(item);checkButtons();} //async()=>await onclickTablecell(ui,ri,o);
		}
	}
	DA.tinfo.ifrom = ifrom;
	checkButtons();
}

