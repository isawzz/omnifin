function stringAfter(s, sSub, case_sensitive = false) {
	// If case sensitivity is off, convert both strings to lowercase for comparison
	let s1=s,sSub1=sSub;
	if (!case_sensitive) {
			s1 = s.toLowerCase();
			sSub1 = sSub.toLowerCase();
	}

	// Find the position of the first occurrence of sSub in s
	const index = s1.indexOf(sSub1);

	// If sSub is not found, return the original string
	if (index === -1) {
			return s;
	}

	// Return the substring before the first occurrence of sSub
	return s.substring(index+sSub.length);
}
function stringBefore(s, sSub, case_sensitive = false) {
	// If case sensitivity is off, convert both strings to lowercase for comparison
	let s1=s,sSub1=sSub;
	if (!case_sensitive) {
			s1 = s.toLowerCase();
			sSub1 = sSub.toLowerCase();
	}

	// Find the position of the first occurrence of sSub in s
	const index = s1.indexOf(sSub1);

	// If sSub is not found, return the original string
	if (index === -1) {
			return s;
	}

	// Return the substring before the first occurrence of sSub
	return s.substring(0, index);
}
function stringBetween(s, sub1, sub2, case_sensitive = false) {
	//test: stringBetween(qCurrency(),'select','from');
	return stringAfter(stringBefore(s,sub2),sub1);
}
