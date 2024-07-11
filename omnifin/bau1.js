
async function onclickSort(ev) { await sortRecords(); }
async function onclickSortFast(ev) { await sortRecords(null, false); }
async function sortRecords(headerlist, allowEdit = true) {
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	if (nundef(headerlist)) {
		let cells = DA.cells;
		let selitems = cells.filter(x=>x.isSelected); console.log(selitems);
		headerlist = selitems.map(x=>x.header);
	}
	assertion(!isEmpty(headerlist),'sortRecords with empty headerlist!!!');

	console.log(headerlist);

	let result = await mGather(null, {}, { content:{func:uiTypeSortForm,data:headerlist}, type: 'freeForm' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);
	return;
	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}

