
async function onclickFilter(ev) { await filterRecords(); }
async function onclickFilterFast(ev) { await filterRecords(null, false); }
async function filterRecords(exp, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];
	if (nundef(exp)) { exp = extractFilterExpression(); }
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	let i = DA.tinfo;
	records = dbToList(exp);
	showChunkedSortedBy(i.dParent, i.title, i.tablename, records, headers, header);
}
async function onclickBackHistory() {
	console.log(M.qHistory)
	let o = M.qHistory.pop();
	if (isdef(o)) {
		let records = dbToList(o.q,false);
		showChunkedSortedBy(UI.d, o.tablename, o.tablename, records);
	}
}
function dbHistory(q,addToHistory){
	if (addToHistory) {
		let q1 = q.toLowerCase().trim();
		if (q1.startsWith('select')) {
			if (isdef(DA.qCurrent)) M.qHistory.push({ q: DA.qCurrent, tablename: wordAfter(q1, 'from') });
			DA.qCurrent = q1;
		}

		//consloghist();
	}


}


