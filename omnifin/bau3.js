
async function onclickExecute() {
	let q = UI.ta.value;
	let tablename = stringAfter(q.toLowerCase(),'from').trim(); console.log('tablename',tablename);
	let res = dbq(q);
	if (isdef(res)) res=res[0];

	console.log(res)
	showAnyTable(tablename,res)
}













