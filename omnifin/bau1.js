
function generateSQLEqualsHAVING(a, text) {
	if (a!='mcc' && a!='tag_names') return null;
	//return isNumber(text) ? Number(text) == 0 ? `(${a} IS NULL OR ${a}=0)` : `${a}=${text}`
	if (a == 'mcc' && isEmpty(text)){
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) IS NULL`;
	}else if (a == 'tag_names' && isEmpty(text)){
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) IS NULL OR
    group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = ''`;

	}else if (a == 'mcc'){
		return `group_concat(CASE WHEN tg.category = 'mcc' THEN tg.tag_name ELSE NULL END) = '${text}`;
	}else if (a == 'tag_names'){
		return `group_concat(CASE WHEN tg.category <> 'mcc' AND tg.tag_name NOT GLOB '*[0-9]*' THEN tg.tag_name ELSE NULL END) = '${text}'`;
	}
}

function generateSQLEqualsWHERE(a, text) {
	if (a=='mcc' || a=='tag_names') return null;
	return isEmpty(text) ? `(${a} IS NULL OR ${a}='')` : `${a}='${text}'`;
}
