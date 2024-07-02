
function dbRecords(q) {
	let tablename = stringAfter(q.toLowerCase(), 'from').trim(); //console.log('tablename', tablename);
	let res = dbq(q);
	if (isdef(res)) res = res[0];

	return isdef(res) ? dbResultToList(res) : [];
}
function dbGetTableNames() {
	let res = dbRecords(qTablenames());
	//console.log(res);
	return res;
}













