function dbq(q) {	return DB.exec(q);}
function dbResultToDict(res,keyprop){
	let list = dbResultToList(res);
	return list2dict(list,keyprop);
}
function dbResultToList(res){
	if (isList(res) && res.length == 1 && isdef(res[0].columns)) res = res[0];
	//console.log(res);
	let headers = res.columns; //getHeaderNames(res.columns);
	let records = [];
	for(const row of res.values){
		let o={};
		for(let i=0;i<headers.length;i++){ 
			o[headers[i]]=row[i];
		}
		records.push(o);
	}
	return records;
}


