
function showRecords(q, dParent, info = {}) {
	//info may contain: records,headers,sorting=dict per header,w=dict per header,header
	showRecordsPrep(q, dParent, info);
	let [records, headers, header, t, sorting, diw] = [info.records, info.headers, info.header, info.t, info.sorting, info.diw];

	//tSortRecords(records,header,sorting);

	tAddHeaders(t,headers);

	tLoadMoreRows(t, records, headers, diw);

	setTimeout(()=>weiter(info),10); 
}
function weiter(info){
	let [records, headers, sorting, diw, header, tablename, tCont, t, q, dParent]=[info.records, info.headers, info.sorting, info.diw, info.header, info.tablename, info.tCont, info.t, info.q, info.dParent];
	
	
	tLoadRowsRest(t, records, headers, diw);
	console.log('DONE!')
	// tLoadMoreRows(t, records, headers,diw);
	// tCont.onscroll = () => tIfCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	tOnClickHeaders(t, q, dParent, info);
	console.log(info)

	//infoNew.wHeaders = tGetHeaders(t).map(x => x.offsetWidth); //console.log(infoNew.wHeaders)


	// addSumAmount(findHeaderWithName(t, 'amount'), records);

	// activateResizers(t)

}
function tAddHeaders(t,headers){
	let thead = mDom(t, {}, { tag: 'thead' });
	let tbody = mDom(t, {}, { tag: 'tbody' });
	let rHeaders = mDom(thead, {}, { tag: 'tr' });
	headers.forEach((hdr, i) => {
		let th = mDom(rHeaders, {className:'sortable'}, { tag: 'th',dataIndex:i });
		let d1 = mDom(th, {}, { html: hdr });
		let d2 = mDom(th); //fuer extra infos
		let dres = mDom(th, { className: 'resizer' });
		//let th = mDom(rHeaders, {}, { tag: 'th', html: `${hdr}<div class="resizer">&nbsp;</div>`, sortDir: hdr == header ? sortDir : null });
		//if (isdef(DA.wHeaders[hdr])) mStyle(th, { w: DA.wHeaders[hdr] });
	});
}
function tGetHeaderFromUi(ui){return ui.firstChild.innerHTML;}
function tGetHeaderUis(t) { return Array.from(t.querySelectorAll('th.sortable')); } //t.firstChild.getElementsByTagName('th')); }

function tIfCloseToBottomLoadMoreRecords(tCont, t, records, headers) {
	//console.log('Element is scrolling');
	if (tCont.scrollTop + tCont.clientHeight >= tCont.scrollHeight - 50) {
		console.log('...adding records...');
		tLoadMoreRows(t, records, headers);
	}
}
function tLoadMoreRows(t, recs, headers,diw={}) {
	let tbody = t.querySelector('tbody');
	let irow = arrChildren(tbody).length; // assumes headers shown!
	let n = 30;
	for (const rec of arrTake(recs, n, irow)) {
		let r = mDom(tbody, {}, { tag: 'tr' });
		let icol = -1;
		for (const k of headers) {
			let html = rec[k];
			icol++;
			let c = mDom(r, { cursor: 'pointer' }, { tag: 'td', irow, icol, html });	//console.log('header',irow,icol,headers[icol])
			let bg = dbFindColor(html, headers[icol]); if (isdef(bg)) mStyle(c, { bg, fg: 'contrast' }); //color cell
			//if (isdef(diw[k])) {mStyle(c, { w:diw[k] });console.log(diw[k]);}
			c.onclick = () => toggleItemSelection(c);
		}
		irow++;
	}
}
function tSortRecords(records,header,sorting={}){
	let sortCur = sorting[header];
	let sortDir = sortCur == 'asc' ? 'desc' : 'asc';
	records = sortDir == 'asc' ? sortByEmptyLast(records, header) : sortByDescending(records, header);
	sorting[header] = sortDir;
	return [sorting,records];
}
function showRecordsPrep(q, dParent, info) {
	addKeys({sorting:{},diw:{id:40,dateof:40}},info);
	let records = valf(info.records, dbToList(q));
	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 }); mLinebreak(dParent);
	if (records.length == 0) return;
	let headers = valf(info.headers, Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header, headers[0]);
	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let t = mDom(tCont, { className: 'table', w100: true }, { tag: "table" });
	[info.records, info.headers, info.header, info.tablename, info.tCont, info.t, info.q,info.dParent]=[records, headers, header, tablename, tCont, t, q,dParent];
	//return [records, headers, header, tablename, tCont, t];
}








