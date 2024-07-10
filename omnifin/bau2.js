
function handleSticky() { let d = mBy('dNav'); if (window.scrollY >= 88) mClass(d, 'sticky'); else mClassRemove(d, 'sticky'); }
function checkButtons() {
	let bs=arrChildren('dButtons'); bs.map(x=>disableButton(x));
	if (DB) enableButton('bDownload');
	let info = DA.tinfo; //are there records shown?
	if (nundef(info)) return;
	let [ifrom, ito, records] = [info.ifrom, info.ito, info.records];
	if (ifrom > 0) enableButton('bPgUp');
	if (ito < records.length) enableButton('bPgDn');
	if (!isEmpty(M.qHistory)) enableButton('bBack');
	if (DA.cells.find(x=>x.isSelected)) ['bFilter','bFilterFast','bSort','bSortFast'].map(x=>enableButton(x));
}
function mNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	
	let dTop=mDom(dNav,{class:'centerFlexV'});
	mDom(dTop, { fz: 34, mabottom: 10, w100: true }, { html: `Omnifin` });
	let dm = mDom(dTop, { gap: 10, className: 'centerflexV' }); 
	let nav = mMenu(dm);
	let commands = {};
	commands.overview = menuCommand(nav.l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	commands.sql = menuCommand(nav.l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);
	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	nav.commands = commands;

	mLinebreak(dTop);
	let db = mDom(dTop, { gap: 10, className: 'centerflexV' },{id:'dButtons'}); 
	mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('filter', onclickFilterFast, db, {}, 'button', 'bFilterFast');
	mButton('custom filter', onclickFilter, db, {}, 'button', 'bFilter'); 
	mButton('sort', onclickSortFast, db, {}, 'button', 'bSortFast');
	mButton('custom sort', onclickSort, db, {}, 'button', 'bSort');
	// mButton('add tag', onclickTagForAll, db, {}, 'button','bAddTag');

	mDom(db,{w:20})
	mButton('PgUp', () => showChunk(-1), db, { w: 25 }, 'button', 'bPgUp');
	mButton('PgDn', () => showChunk(1), db, { w: 25 }, 'button', 'bPgDn');
	mButton('download db', onclickDownloadDb, db, {}, 'button', 'bDownload');


	return nav;
}













