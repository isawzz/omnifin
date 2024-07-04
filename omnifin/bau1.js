
async function menuOpenSql() {
	let d = mDom('dMain');
	let ta = UI.ta = mDom(d, { 'white-space': 'pre-wrap', w100: true, 'border-color': 'transparent' }, { tag: 'textarea', id: 'taSql', rows: 4, value: 'select * from transactions' });
	ta.addEventListener('keydown', function (event) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			onclickExecute();
		}
	});
	let db = mDom(d,{gap:10}); mFlex(db);
	mButton('Execute', onclickExecute, db, {}, 'button');
	mButton('Clear', () => UI.ta.value = '', db, {}, 'button');
	UI.d = mDom('dMain', { className: 'section' });

}
async function onclickExecute() {
	let q = UI.ta.value;
	let tablename = dbGetTableName(q);
	let records = dbToList(q); 
	showTableSortedBy(UI.d, 'Result', records); 
}





