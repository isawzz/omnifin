
function addSumAmount(ui, records) {
	if (nundef(ui)) return;
	//console.log(ui);

	let sum = arrSum(records, 'amount');
	if (isNumber(sum)) sum = Math.round(sum);

	mDom(ui, {}, { html: sum })

}

