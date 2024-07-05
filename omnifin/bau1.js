
function showChunkedSortedBy(dParent, title, tablename, records, headers, header) {
  console.log('hallo')
	if (DA.sortedBy == header) { sortByDescending(records, header); DA.sortedBy = null; }
	else { sortBy(records, header); DA.sortedBy = header; }
	mClear(dParent);
	mText(`<h2>${title} (${tablename})</h2>`, dParent, { maleft: 12 });
	mButton('next',()=>showChunk(1),dParent,{},'button');
	let dTable=mDom(dParent)
	DA.tinfo={};
	addKeys({dParent,title,tablename,dTable,records,headers,header,ifrom:0,size:100},DA.tinfo);
	showChunk(0);
}
function showChunk(inc){
	let o=DA.tinfo;
	let [dParent,title,tablename,dTable,records,headers,header,ifrom]=[o.dParent,o.title,o.tablename,o.dTable,o.records,o.headers,o.header,o.ifrom+inc*o.size];
	let chunkRecords = records.slice(ifrom,ifrom+100);
	mClear(dTable);
	let t = UI.dataTable = mDataTable(chunkRecords, dTable, null, headers, 'records');
	if (nundef(t)) return;
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = () => showChunkedSortedBy(dParent, title, tablename, records, headers, ui.innerHTML);
	}
	if (tablename != 'transactions') return records;
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	}
	DA.tinfo.ifrom = ifrom;
}



