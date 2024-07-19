
function showNavMenu() {
	let dNav = mBy('dNav');
	mStyle(dNav, { overflow: 'hidden', box: true, padding: 10, className: 'nav' });
	let dTop = mDom(dNav, { display: 'flex', 'align-items': 'center', 'justify-content': 'space-between', 'flex-flow': 'row nowrap' });
	let centerflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let startflex = { gap: 10, display: 'flex', 'align-items': 'center' };
	let [l, m, r] = [mDom(dTop, startflex), mDom(dTop, centerflex), mDom(dTop, centerflex)];
	let dlogo = mDom(l, { fz: 34 }, { html: `Omnifin` });
	let commands = {};
	commands.overview = menuCommand(l, 'nav', 'overview', 'Overview', menuOpenOverview, menuCloseOverview);
	//commands.sql = menuCommand(l, 'nav', 'sql', 'Sql', menuOpenSql, menuCloseSql);

	let db = mDom(dNav, { matop: 12, maleft: 128, gap: 10, className: 'centerflexV' }, { id: 'dButtons' });
	// mButton('<<', onclickBackHistory, db, {}, 'button', 'bBack');
	mButton('clear sorting', () => { DA.info.sorting = { id: 'desc' }; sortRecordsBy('id') }, db, {}, 'button', 'bSortFast');
	mButton('filter', filterRecords, db, {}, 'button', 'bSortFast');

	// commands.test = menuCommand(nav.l, 'nav', 'test', 'Test', menuOpenTest, menuCloseTest);
	//nav.commands = commands;
	return { commands, dNav }
}











