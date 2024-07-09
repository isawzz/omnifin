
function dbFindColor(tablename,header,innerHTML){
	return header.includes('_name')? lookup(M.dbColors,[innerHTML,'color']):null;
}













