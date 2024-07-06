
async function onclickFilter(ev){

	//header 
	//contains,==,!=,<=,>=,<,>
	//val or header
	//console.log('filter',DA.tinfo);

	let [records, headers, header]=[DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = {headers}; //.map(x => ({ name: x, value: false }));
	
	let result = await mGather(mBy('bFilter'), {}, { content, type: 'filter' });
	// result = {val:'unit',op:'!=',val2:'USD'}
	// result = {val:'amount',op:'<',val2:'1000'}
	// result = {val:'receiver_name',op:'==',val2:'merchant'}
	//console.log(result)

	if (!result || isEmpty(result)) { console.log('operation cancelled!'); return; }
	let recs = records.filter(x=>{
		let op = result.op;
		let val1=x[result.val];
		let val2 = headers.includes(result.val2)?x[result.val2]:result.val2;
		if (isNumber(val1)) val1=Number(val1);
		if (isNumber(val2)) val2=Number(val2);
		let [e1,e2]=[!val1 || isEmpty(val1),!val2 || isEmpty(val2)];
		console.log(val1,op,val2);
		switch(op){
			case '==': return val1 == val2; break;
			case '!=': return val1 != val2; break;
			case '<': return val1 < val2; break;
			case '>': return val1 > val2; break;
			case '<=': return val1 <= val2; break;
			case '>=': return val1 >= val2; break;
			case '&&': return val1 && val2; break;
			case '||': return val1 || val2; break;
			case 'nor': return e1 && e2; break;
			case 'xor': return e1&!e2 || e2&&!e1; break;
			case 'contains': return isString(val1) && val1.includes(val2); break;
			default: return false;
		}
	});

	DA.tinfo.records = recs;
	console.log('recs',recs);
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, [])
}
async function onclickMultiSort(ev){
	console.log('multisort',DA.tinfo);

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header]

	let content = headers.map(x => ({ name: x, value: false }));
	let result = await mGather(ev.target, {}, { content, type: 'checkList' });
	if (!result || isEmpty(result)) { console.log('nothing selected'); return; }

	console.log(result);

	records.sort(multiSort(result));// = sortByMultipleProperties(records,...result);
	DA.tinfo.records = records;
	DA.tinfo.header = result;
	showChunkedSortedBy(DA.tinfo.dParent, DA.tinfo.title, DA.tinfo.tablename, DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header)

}
async function onclickTagForAll(ev){
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header];

	let allTags = dbToList(`select * from tags`,'tag_name');
	let allTagNames = allTags.map(x=>x.tag_name)
	let content = allTagNames.map(x => ({ key: x, value:currentTagNames.some(y=>y == x) }));
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput', charsAllowedInWord:['-_'] });


}











