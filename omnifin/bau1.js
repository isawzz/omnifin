
async function onclickAddTag(idtrans, item) {

	//transaction id 3 hat tag id 51
	let currentTagObjects = M.transaction_tags.filter(x=>x.id == idtrans); //console.log(rtags); //return;

	let currentTagNames = currentTagObjects.map(x=>M.tagsIndex[x.tag_id].tag_name); //console.log(rtagNames); //return;//M.tag_name.

	let allTagNames = Object.keys(M.tagsByName); console.log(allTagNames)
	let content = allTagNames.map(x => ({ key: x, value:currentTagNames.includes(x) }));
	//content = sortBy(content,x=>x.value)
	let list = await mGather(null, {h:800,hmax:800}, { content, type: 'checkListInput' });
	console.log(list);

	//look if there is any tag that has not been there before
	let newTagNames=arrWithout(list,currentTagNames);
	console.log('new tags',newTagNames);


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


