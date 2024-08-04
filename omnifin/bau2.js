
async function toggleTagView(){
	let [records, headers, q] = [DA.info.records, DA.info.headers, DA.info.q];
	let selitems = getSelItems(); //console.log('selitems', selitems);

	let tagNames = dbGetTagNames();

	let b=mBy('bToggleTagView');
	let caption = b.innerHTML;

	if (caption == 'tag view'){
		//show expanded tag columns
		let qnew = qToTagView(q);
		DA.info.isTagView=true;
		showRecords(qnew,UI.d);
		//b.innerHTML = 'compact view'

	}else{
		//remove tag columns
		let qnew = qFromTagView(q);

		//console.log(qnew);

		delete DA.info.isTagView;
		showRecords(qnew,UI.d);
		//DA.isTagView=false;
		// b.innerHTML = 'tag view'

	}

	//console.log(records)
}

