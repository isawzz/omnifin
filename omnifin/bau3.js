
function mSwitch(offstate,onstate){
	let d=mDom(null,{className:'swcontainer'})
	let sp=mDom(d,{className:'swoff-text'},{tag:'span',html:offstate});
	let l=mDom(d,{className:'swswitch'},{tag:'label'});
	let inp=mDom(l,{className:'swswitch'},{tag:'input',type:'checkbox',id:'exampleSwitch'});
	let sp1=mDom(l,{className:'swslider round'},{tag:'span'});
	let spon=mDom(d,{className:'swon-text'},{tag:'span',html:onstate});
	return d;
	let html = `
			<div class="swcontainer">
			<span class="swoff-text">${offstate}</span>
			<label class="swswitch">
				<input type="checkbox" id="exampleSwitch">
				<span class="swslider round"></span>
			</label>
			<span class="swon-text">${onstate}</span>
			</div>
		`;
	return mCreateFrom(html);
}


async function onclickAscDescButton(ev){
	let inp = ev.target;
	console.log(':::',inp)
}
async function uiTypeSortForm(dParent, data, resolve) {
	//was will ich von der sort form? reihenfolge der keys, up/down sort, 
	console.log(data);

	let headerlist=data;

	let dlist = mDom(dParent);
	for(const h of headerlist){

		let d=mDom(dlist,{className:'centerFlexV',gap:4});
		let d1=mDom(d,{},{html:h});
		let b=mToggleButton('asc','desc',null,d)


	}


	let handler = () => resolve(null);
	// mButton('done', handler, d, { classes: 'input', margin: 10 });
}












