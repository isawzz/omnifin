
async function onclickFilter(ev, exp) {

	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers, DA.tinfo.header];

	if (nundef(exp)) {
		exp=extractFilterExpression();
		let content = { exp, caption: 'Filter' };
		exp = await mGather(null, {}, { content, type: 'textarea', value:exp });
	}


	if (!exp || isEmpty(exp)) { console.log('operation cancelled!'); return; }
	
  //console.log('exp', exp);


  let i=DA.tinfo;
  records = dbToList(exp);
  showChunkedSortedBy(i.dParent,i.title,i.tablename,records,headers,header);

}



