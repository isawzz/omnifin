async function onclickTablecell(ui,ri,o){

  let result = await mGather(ui, {}, { content: { ri, o }, type: 'tablecell' });

	console.log('result',result)

} 

















