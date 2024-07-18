
async function sortRecordsBy(h, allowEdit = false){
	//sorting is a dict by header 'asc','desc'
	let [q,dParent,sorting]=[DA.info.q,DA.info.dParent,DA.info.sorting];

	let s=sorting[h];if (s == 'asc') sorting[h]='desc'; else sorting[h]='asc';

	let q1=sqlUpdateOrderBy(q, sorting); console.log(q1); //return;

	await showRecords(q1,dParent);

}
async function filterRecords(exp, allowEdit = true) {
	//console.log('exp',exp);
	exp = extractFilterExpression();
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }

	await showRecords(exp,DA.info.dParent);

	return;
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];
	if (nundef(exp)) { exp = extractFilterExpression(); }
	if (allowEdit) { let content = { exp, caption: 'Filter' }; exp = await mGather(null, {}, { content, type: 'textarea', value: exp }); }
	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	let i = DA.tinfo;
	records = dbToList(exp);
	showChunkedSortedBy(i.dParent, i.title, i.tablename, records, headers, header);
}






