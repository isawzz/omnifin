var Counter=0;
function showChunkedSortedBy(dParent, title, tablename, records, headers, header) {

	if (isEmpty(records)) {mText('no data',dParent); return null; }
	if (nundef(headers)) headers = Object.keys(records[0]);
  if (nundef(header)) header = headers[0];
  console.log('___ show',Counter++,DA.tinfo);
  console.log(DA.sortedBy,header);
  
	if (DA.sortedBy == header) { records = sortBy(records, header); DA.sortedBy = null; }
	else { records = sortByDescending(records, header); DA.sortedBy = header; }
	mClear(dParent);
	mText(`<h2>${title} (${tablename})</h2>`, dParent, { maleft: 12 });
	mButton('next',()=>showChunk(1),dParent,{},'button');
	let dTable=mDom(dParent)
	DA.tinfo={};
	addKeys({dParent,title,tablename,dTable,records,headers,header,ifrom:0,size:100},DA.tinfo);
	showChunk(1);
}
function showChunk(inc){
	let o=DA.tinfo;
	let [dParent,title,tablename,dTable,records,headers,header,ifrom]=[o.dParent,o.title,o.tablename,o.dTable,o.records,o.headers,o.header,o.ifrom];

  if (ifrom >= records.length) ifrom=0;
  let ito = Math.min(ifrom+inc*o.size,records.length);

  let chunkRecords = records.slice(ifrom,ito);
	
  if (isdef(UI.dataTable)) mRemove(UI.dataTable.div); mClear(dTable);
	let t = UI.dataTable = mDataTable(chunkRecords, dTable, null, headers, 'records');
	if (nundef(t)) {console.log('UI.dataTable is NULL');return;}
	let d = t.div;
	mStyle(d, { 'caret-color': 'transparent' });
	let headeruis = Array.from(d.firstChild.getElementsByTagName('th'));
	for (const ui of headeruis) {
		mStyle(ui, { cursor: 'pointer' });
		ui.onclick = (ev) => {evNoBubble(ev);showChunkedSortedBy(dParent, title, tablename, records, headers, ui.innerHTML);}
	}
	if (tablename != 'transactions') return;
	for (const ri of t.rowitems) {
		let r = iDiv(ri);
		let id = ri.o.id;
		let h = hFunc('tag', 'onclickAddTag', id, ri.index); let c = mAppend(r, mCreate('td')); c.innerHTML = h;
	}
	DA.tinfo.ifrom = ito;
}



