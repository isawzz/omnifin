
async function onclickTagForAll(ev,list){
	let [records, headers, header] = [DA.tinfo.records, DA.tinfo.headers,DA.tinfo.header];

	let allTags = dbToList(`select * from tags`,'tag_name').filter(x=>!isNumber(x.tag_name));
	let allTagNames = allTags.map(x=>x.tag_name)
	let content = allTagNames.map(x => ({ key: x, value:false }));
	if (nundef(list)) list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput', charsAllowedInWord:['-_'] });
	//console.log('result',list)

	for(const tname of list){
		let otag = allTags.find(x=>x.tag_name == tname);
		for(const rec of records){
			let recs1 = dbToList(`select * from transaction_tags where id='${rec.id}' and tag_id='${otag.id}';`); // where tag_id = '${otag.id}' and id = '${rec.id}'`);
			//console.log(recs1);
			if (isEmpty(recs1)){
				//console.log('adding tag',tname)
				addTagAndReport(rec.id, tname, reportCategory='default');
			}
			// addTagAndReport(rec.id, tagName, reportCategory='default') 
		}
	}

	onclickCommand(null,UI.lastCommandKey);
	//rerunCurrentCommand();

}












