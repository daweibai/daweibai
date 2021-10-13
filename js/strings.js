/* Handy functions to manipulate strings */

/* Convert a number to string and pad with leading zeros (to create filenames such as "0001.png") 
 n = number
 p = number of total characters in number
 */
function zp_n2str(n, p) {
	var num = "" + n;
	if (num.length > p) return "<error>"; // number too large to fit
	var padding = "";
	for (var i = 0; i < p - num.length; i++){
		padding+= "0";
	}
	return padding + num;
}

/* boolean ! operating on integers */
function Not(n){
    return Number(!n);
}

/* anything evaluating to false = -1, true = +1 */
function Contrast(n){
    return (n? 1 : -1); 
}
