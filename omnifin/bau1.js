
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

function saveDatabase() {
	const data = db.export();
	const blob = new Blob([data], { type: 'application/octet-stream' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'test.db';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}


