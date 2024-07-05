
async function onclickMultiSort(ev){
	console.log('multisort',DA.tinfo);

	let [records, headers,header]=[DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(ev.target, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}

async function onclickFilter(){

	//header 
	//contains,==,!=,<=,>=,<,>
	//val or header
	console.log('multisort',DA.tinfo);

	let [records, headers,header]=[DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(ev.target, {}, { content, type: 'filter' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);
}












