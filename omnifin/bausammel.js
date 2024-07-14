
//#region stages showRecord SEHR COOL!!!!

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




