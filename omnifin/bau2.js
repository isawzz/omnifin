
function onclickTaggedLimit10() { showTableInMain(qTaggedTransactionsLimit10(),['id','dateof','description']); }

function showTableInMain(q,headers){
	let tablename = wordAfter(q.toLowerCase(),'from').trim(); //console.log('tablename',tablename);
	let res = dbq(q);
	
	if (isdef(res)) res=res[0];
	if (nundef(res)) {let d=ensuredT();d.innerHTML = `no records found in ${tablename}`; return []; }
	//console.log(res)
	showQueryResult(tablename,res,headers);

}

















