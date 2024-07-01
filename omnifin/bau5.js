
function getHeaderNames(arr){
	let di={dateof:'date',sender_name:'from',sender_owner:'owner',receiver_name:'to',receiver_owner:'owner',description:'note'};
	let headers = arr.map(x => valf(di[x], x));
	return headers;
}













