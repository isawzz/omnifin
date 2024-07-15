
//#region stages showRecord SEHR COOL!!!!

//#region stage 4
function activateResizers(t){
	const resizers = document.querySelectorAll('.resizer');

	for(const resizer of resizers){
		resizer.addEventListener('mousedown',e=>startResizing(e,resizer));
	}
	
	function startResizing(e,resizer){
		evNoBubble(e);
		DA.isResizing = true;
		let info=DA.resinfo={};
		info.currentResizer = resizer;
		info.startX = e.pageX;
		let th = info.th = info.currentResizer.parentElement;
		info.header = firstWord(th.innerHTML);
		info.startWidth = info.th.offsetWidth;
		//document.mousemove = 
		resizer.addEventListener('mousemove', resizeColumn);
		resizer.addEventListener('mouseup', stopResize);
	}
	function stopResize(e) {
		console.log('stopResize!')
		evNoBubble(e);
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
	function doDrag(ev){
		let info=DA.resinfo;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';

	}
	function resizeColumn(e){
		evNoBubble(e);
		let info=DA.resinfo;
		document.addEventListener('mousemove', doDrag);
		document.addEventListener('mouseup', stopDrag);
	}
	function stopDrag() {
		console.log('stopDrag!')
		let info = DA.resinfo;
		DA.resinfo = null;
		DA.isResizing = false;
		DA.wHeaders[info.header]=firstNumber(info.th.style.width); console.log(DA.wHeaders);
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}
}
function handleScroll() {
	console.log('scrolling...')
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
		console.log('DO IT NOW!!!');
	}
};
function showRecords(q, dParent, info = {}) {
	//info may contain: records,headers,sorting=dict per header,header
	let records = valf(info.records, dbToList(qTTList()));
	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 }); mLinebreak(dParent);
	if (records.length == 0) return;

	let headers = valf(info.headers, Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header, headers[0]);
	if (nundef(DA.wHeaders)) {
		DA.wHeaders = {id:40,dateof:40};
	}
	let sorting = valf(info.sorting, {});
	let sortCur = sorting[header];
	let sortDir = sortCur == 'asc' ? 'desc' : 'asc';
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);
	console.log('showRecords', header, sortDir)
	sorting[header] = sortDir;
	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' });
	//console.log('wHeaders:',info.wHeaders)
	headers.forEach((hdr, i) => {
		let th = mDom(rHeaders, {}, { tag: 'th', html: `${hdr}<div class="resizer">&nbsp;</div>`, sortDir: hdr == header ? sortDir : null });
		if (isdef(DA.wHeaders[hdr])) mStyle(th, { w: DA.wHeaders[hdr] });
	});
	//headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: `${x}<div class="resizer">&nbsp;</div>`, sortDir: x == header ? sortDir : null }));
	let infoNew = { records, headers, header, sorting }; //console.log('showRecords_sorting:', infoNew.header, infoNew.sorting[header]);

	loadMoreRows(t, records, headers);
	//infoNew.wHeaders = tGetHeaders(t).map(x => x.offsetWidth); //console.log(infoNew.wHeaders)

	headersOnClickSort(t, q, dParent, infoNew);

	tCont.onscroll = () => ifCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	addSumAmount(findHeaderWithName(t, 'amount'), records);

	activateResizers(t)

}
function _1activateResizers(t){
	const resizers = document.querySelectorAll('.resizer');
	let currentResizer;
	const info={};

	resizers.forEach(resizer => {
		resizer.addEventListener('mousedown', (e) => {
			currentResizer = resizer;
			document.addEventListener('mousemove', resizeColumn);
			document.addEventListener('mouseup', stopResize);
		});
	});

	function resizeColumn(e) {
		const th = currentResizer.parentElement;
		const startX = e.pageX;
		const startWidth = th.offsetWidth;
		const table = th.closest('table');
		const columnIndex = Array.from(th.parentNode.children).indexOf(th);

		const doDrag = (event) => {
			const newWidth = startWidth + (event.pageX - startX);
			table.querySelectorAll('tr').forEach(row => {
				row.children[columnIndex].style.width = newWidth + 'px';
			});
		};

		document.addEventListener('mousemove', doDrag);

		function stopDrag() {
			document.removeEventListener('mousemove', doDrag);
			document.removeEventListener('mouseup', stopDrag);
		}

		document.addEventListener('mouseup', stopDrag);
	}

	function stopResize() {
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
}

function activateColumnResizers(t) {
	const resizers = document.querySelectorAll('.resizer');
	resizers.forEach(elem => {
		elem.mousedown = ev => {
			evNoBubble(e);
			DA.isResizing = true;
			let info = DA.resizeInfo = {};
			info.startX = e.pageX;
			info.th = elem.parentElement;
			info.startWidth = info.th.offsetWidth;
			const doDrag = (ev) => {
				console.log('hallo')
				let info=DA.resizeInfo;
				const newWidth = info.startWidth + (ev.pageX - info.startX);
				info.th.style.width = newWidth + 'px';
			};
		
			document.addEventListener('mousemove', doDrag);
			// elem.parentNode.parentNode.mousemove = ev=>{
			// 	let info=DA.resizeInfo;
			// 	const newWidth = info.startWidth + (ev.pageX - info.startX);
			// 	mStyle(info.th,{w:newWidth}); 
			// }
			elem.mouseup = e => {
				document.removeEventListener('mousemove', doDrag);
				if (!DA.isResizing) return;
				elem.mouseup = null;
				let info = DA.resizeInfo;
				const newWidth = info.startWidth + (ev.pageX - info.startX);
				mStyle(info.th, { w: newWidth });
				DA.isResizing = false;
				delete DA.resizeInfo;
			}
		}
	});
}

function findHeaderWithName(t, name) {
	let headeruis = tGetHeaders(t);
	return headeruis.find(x => firstWord(x.innerHTML, true) == name)
}
function headersOnClickSort(t, q, dParent, info) {
	let headeruis = tGetHeaders(t);
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' }); //console.log(ui,firstWord(ui.innerHTML),ui.offsetWidth); //mGetStyle(ui,'w'),getRect(ui))
		ui.onclick = (ev) => {
			evNoBubble(ev);
			if (DA.isResizing) return;
			info.header = firstWord(ui.innerHTML, true);
			showRecords(q, dParent, info);
		}
	}
}
function ifCloseToBottomLoadMoreRecords(tCont, t, records, headers) {
	//console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		loadMoreRows(t, records, headers);
	}
}
function loadMoreRows(t, recs, headers) {
	let irow = arrChildren(t).length - 1; // assumes headers shown!
	let n = 50;
	for (const rec of arrTake(recs, n, irow)) {
		let r = mDom(t, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = rec[k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			let w=lookup(DA,['wHeaders',k]); if (w) mStyle(c,{w});
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}
function mToggleSelection(elem) {
	let att = elem.getAttribute('selected');
	elem.setAttribute(!att)
	if (att == 'true') mClass(elem, 'framedPicture'); else mRemoveClass(elem, 'framedPicture');
}
function tGetHeaders(t) { return Array.from(t.firstChild.getElementsByTagName('th')); }

function colorCells(t, tablename) {
	let headers = tGetHeaders(t).map(x => firstWord(x.innerHTML, true));
	for (const cell of t.getElementsByTagName('td')) {//rowItems) {
		console.log('cell', cell);
		let bg = dbFindColor(tablename, headers[Number(cell.getAttribute('icol'))], cell.innerHTML);
		if (nundef(bg)) continue;
		mStyle(cell, { bg, fg: 'contrast' });
		// 	if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
	}
	return;
	// let r = iDiv(ri);

	// //console.log(r,arrChildren(r)); break;
	// //let id = ri.o.id; let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	// let tds = arrChildren(r);
	// for (const ui of tds) {
	// 	let item = { ri, div: ui, text: ui.innerHTML, record: ri.o, isSelected: false, irow: t.rowItems.indexOf(ri), icol: tds.indexOf(ui) };
	// 	item.header = headers[item.icol];
	// 	cells.push(item);
	// 	let bg = dbFindColor(item.tablename, item.header, ui.innerHTML);
	// 	mStyle(ui, { cursor: 'pointer' });
	// 	if (isdef(bg)) mStyle(ui, { bg, fg: 'contrast' });
	// 	ui.onclick = () => { toggleItemSelection(item); checkButtons(); } //async()=>await onclickTablecell(ui,ri,o);
	// }
}
function _showRecords(q, dParent, headers, header, sortDir = 'asc') {
	onresize = null;

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
//#endregion

//#region super mist alles
function activateColumnResizers(t){
	const resizers = document.querySelectorAll('.resizer');

	for(const resizer of resizers){
		resizer.addEventListener('mousedown',e=>startResizing(e,resizer));
	}
	
	function startResizing(e,resizer){
		evNoBubble(e);
		DA.isResizing = true;
		let info=DA.resizeColumns={};
		info.currentResizer = resizer;
		info.startX = e.pageX;
		info.th = info.currentResizer.parentElement;
		info.startWidth = info.th.offsetWidth;
		//document.mousemove = 
		resizer.addEventListener('mousemove', resizeColumn);
		resizer.addEventListener('mouseup', stopResize);
	}
	function stopResize(e) {
		evNoBubble(e);
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', resizeColumn);
		document.removeEventListener('mouseup', stopResize);
	}
	function doDrag(ev){
		let info=DA.resizeColumns;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';
	}
	function resizeColumn(e){
		evNoBubble(e);
		let info=DA.resizeColumns;
		document.addEventListener('mousemove', doDrag);
		document.addEventListener('mouseup', stopDrag);
	}
	function stopDrag() {
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}
}

function resizeColumn(e) {
	//console.log('resize');
	evNoBubble(e);
	let info=DA.resizeColumns;

	const doDrag = (ev) => {
		let info=DA.resizeColumns;
		const newWidth = info.startWidth + (ev.pageX - info.startX);
		info.th.style.width = newWidth + 'px';
	};

	document.addEventListener('mousemove', doDrag);

	function stopDrag() {
		DA.resizeColumns = null;
		document.removeEventListener('mousemove', doDrag);
		document.removeEventListener('mouseup', stopDrag);
	}

	document.addEventListener('mouseup', stopDrag);
}
//#endregion

//#region stage 3

function showRecords2(q, dParent, headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	console.log('showRecords', header, sortDir)

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x, sortDir: x == header ? sortDir : null }));
	headersOnClickSort(t, ...arguments);

	tCont.onscroll = () => ifCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	loadMoreRows(t, records, headers);

}
//#endregion

//#region stage 2
function showRecords(q, dParent, headers, header, sortDir = 'asc') {
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
function headersOnClickSort(t, q, dParent, headers){
	let headeruis = Array.from(t.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => {
			evNoBubble(ev);
			let dir = ui.getAttribute('sortDir'); //asc desc or unset==not sorted yet
			let sortDir = dir == 'asc'?'desc':'asc';
			let text = firstWord(ui.innerHTML); console.log(text,sortDir)
			showRecords(q, dParent, headers, text, sortDir);
		}
	}
}
//#endregion

//#region stage 1
function showRecords(q, dParent, headers, header, sortDir = 'asc') {
	let records = dbToList(qTTList());
	if (records.length == 0) return;

	mClear(dParent);
	let tablename = dbGetTableName(q); //console.log(tablename);
	let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 });

	if (nundef(headers)) headers = Object.keys(records[0]);//['id','description','amount','unit','sender_name','receiver_name']
	if (nundef(header)) header = headers[0];
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);

	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!

	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });
	let rHeaders = mDom(t, {}, { tag: 'tr' }); headers.map(x => mDom(rHeaders, {}, { tag: 'th', html: x }));

	// tCont.addEventListener('scroll', () => {
	// 	console.log('Element is scrolling');
	// 	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
	// 		console.log('...adding records...');
	// 		loadMoreRows(t, records, headers);
	// 	}
	// });
	// tCont.onscroll= () => {
	// 	console.log('Element is scrolling');
	// 	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
	// 		console.log('...adding records...');
	// 		loadMoreRows(t, records, headers);
	// 	}
	// };
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
//#endregion

//#region stage 0
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
	// onscroll = ()=>{
	// 	console.log('HALLO!!!!!')
	// 	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
	// 		mTableAddRows(t,100);
	// 	}
	// } 
	

	let d = t.div;
	mTableAddRows(t,100);	

	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		
		ui.onclick = (ev) => { 
			evNoBubble(ev); 
			let currentDir=DA.tinfo.sortDir;
			
			let text = firstWord(ui.innerHTML);console.log(text)
			let currentHeader = DA.tinfo.header;
			let sortDir = currentHeader == text? currentDir == 'asc'?'desc':'asc':'asc';
			showRecords(q, dParent, headers, text, sortDir); 
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
//#endregion

//#endregion

//#region mSwitch
function mSwitch(offstate,onstate){
	let d=mDom(null,{className:'swcontainer'})
	let sp=mDom(d,{className:'swoff-text'},{tag:'span',html:offstate});
	let l=mDom(d,{className:'swswitch'},{tag:'label'});
	let inp=mDom(l,{className:'swswitch'},{tag:'input',type:'checkbox',id:'exampleSwitch'});
	let sp1=mDom(l,{className:'swslider round'},{tag:'span'});
	let spon=mDom(d,{className:'swon-text'},{tag:'span',html:onstate});
	return d;
	let html = `
			<div class="swcontainer">
			<span class="swoff-text">${offstate}</span>
			<label class="swswitch">
				<input type="checkbox" id="exampleSwitch">
				<span class="swslider round"></span>
			</label>
			<span class="swon-text">${onstate}</span>
			</div>
		`;
	return mCreateFrom(html);
}

//#endregion




