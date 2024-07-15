
function showRecords(q, dParent, info = {}) {
	//info may contain: records,headers,sorting=dict per header,w=dict per header,header
	let [records, headers, header, tablename, tCont, t] = showRecords1(q, dParent, info);

	tSortRecords(records,header,info.sorting);

	tAddHeaders(t,headers);

	loadMoreRows(t, records, headers, info.w);

	console.log(info)

	//infoNew.wHeaders = tGetHeaders(t).map(x => x.offsetWidth); //console.log(infoNew.wHeaders)

	// headersOnClickSort(t, q, dParent, infoNew);

	// tCont.onscroll = () => ifCloseToBottomLoadMoreRecords(tCont, t, records, headers);

	// addSumAmount(findHeaderWithName(t, 'amount'), records);

	// activateResizers(t)

}
function tAddHeaders(t,headers){
	let rHeaders = mDom(t, {}, { tag: 'tr' });
	//console.log('wHeaders:',info.wHeaders)
	headers.forEach((hdr, i) => {
		let th = mDom(rHeaders, {}, { tag: 'th' });
		let d1 = mDom(th, {}, { html: hdr });
		let d2 = mDom(th); //fuer extra infos
		let dres = mDom(th, { className: 'resizer' });
		//let th = mDom(rHeaders, {}, { tag: 'th', html: `${hdr}<div class="resizer">&nbsp;</div>`, sortDir: hdr == header ? sortDir : null });
		//if (isdef(DA.wHeaders[hdr])) mStyle(th, { w: DA.wHeaders[hdr] });
	});
}
function loadMoreRows(t, recs, headers,diw={}) {
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
			if (isdef(diw[k])) mStyle(c, { w:diw[k] });
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
function showRecords1(q, dParent, info) {
	addKeys({sorting:{},w:{id:40,dateof:40}},info);
	let records = valf(info.records, dbToList(qTTList()));
	mClear(dParent);
	let tablename = dbGetTableName(q); let dTitle = mText(`${tablename} (${records.length})`, dParent, { weight: 'bold', fz: 20, maleft: 12, vpadding: 6 }); mLinebreak(dParent);
	if (records.length == 0) return;
	let headers = valf(info.headers, Object.keys(records[0]));//['id','description','amount','unit','sender_name','receiver_name']
	let header = valf(info.header, headers[0]);
	let tCont = mDom(dParent, { h: 400, overy: 'auto', border: '1px solid #ccc', padding: 0, 'caret-color': 'transparent' }); //table container important!
	let t = mDom(tCont, { className: 'table', w100: true, 'border-collapse': 'collapse' }, { tag: "table" });

	return [records, headers, header, tablename, tCont, t];
}








