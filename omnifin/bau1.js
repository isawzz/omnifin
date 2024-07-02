
async function onclickAddTag(idtrans, item) {

	//transaction id 3 hat tag id 51
	//console.log(idtrans, item)

	let tagsSet = [];
	let rtags = M.transaction_tags.filter(x=>x.id == idtrans); //console.log(rtags); //return;

	let rtagNames = rtags.map(x=>M.tagsIndex[x.tag_id].tag_name); //console.log(rtagNames); //return;//M.tag_name.

	let tagNameList = Object.keys(M.tagsByName); console.log(tagNameList)
	let content = tagNameList.map(x => ({ key: x, value:rtagNames.includes(x) }));
	//content = sortBy(content,x=>x.value)
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput' });
	console.log(list);

	

}


