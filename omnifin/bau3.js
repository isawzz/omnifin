
//#region minilib
async function mTimeout(func,ms){
	return new Promise(resolve => {
		setTimeout(() => {
			let result = func(...Array.from(arguments).slice(2));
			resolve(result);
		}, ms); 
	});

}
function measureTextWidth(text,fz,family,weight){
	if (nundef(fz)) fz=measureTextWidth.fz || (measureTextWidth.fz = mGetStyle(document.body,'fz'));
	if (nundef(family)) family=measureTextWidth.family || (measureTextWidth.family = mGetStyle(document.body,'family'));
	if (nundef(weight)) weight=measureTextWidth.weight || (measureTextWidth.weight = mGetStyle(document.body,'weight'));
	let sFont = `${weight} ${fz}px ${family}`;
  var canvas = measureTextWidth.canvas || (measureTextWidth.canvas = document.createElement('canvas'));
  var context = canvas.getContext('2d');
  context.font = sFont;
  var metrics = context.measureText(text);
  return Math.ceil(metrics.width);
}

//#region omni specific
function measureRecord(rec) {
	let res = '';
	var di = { dateof: 100, id: 40, sender_name: 130, receiver_name: 130, amount: 80, unit: 40, MCC: 40 };
	for (const h in rec) {
		let val = rec[h]; console.log(typeof val, val, h);
		if (isdef(di[h])) res += ` ${di[h]}px`;
		else if (isEmpty(val)) res += ' 1fr';
		else {
			res += ` ${Math.min(Math.max(measureTextWidth(val) * 2, 50), 300)}px`;
		}
	}
	console.log(res)
	return res;

}









