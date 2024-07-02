
async function onclickAddTag(idtrans,item){

	let tags = Object.keys(M.tagsDict);
	let content = tags.map(x=>({key:x,value:false}));
	let list = await mGather('dNav', {}, { content, type: 'checkListInput' });
	console.log(list);

	

}


