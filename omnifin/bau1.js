
async function onclickAddTag(idtrans, index) {

	let item = UI.dataTable.rowitems[index];
	console.log('item',item);

	let colitem = item.colitems.find(x=>x.key == 'tag_names');
	console.log(colitem);
	if (nundef(colitem)) {console.log('cannot execute because tag_names column missing!'); return;}

	let currentTagNames = colitem.val.split(',');
	console.log(currentTagNames);

	let allTagNames = Object.keys(M.tagsByName); console.log(allTagNames)
	let content = allTagNames.map(x => ({ key: x, value:currentTagNames.includes(x) }));
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput' });
	console.log(list);
	if (!list) {console.log('add tag CANCELLED!!!'); return; }
	//look if there is any tag that has not been there before
	let newTagNames=arrWithout(list,currentTagNames);
	console.log('new tags',newTagNames);

	for(const t of newTagNames){
		//need to create a report and add it to reports,
		//need to add a record in transaction_tags with corresponding trans_id,tag_id,report_id
	}
}



