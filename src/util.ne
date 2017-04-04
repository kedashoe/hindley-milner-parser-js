lower -> [a-z] {% pp.lower %}
upper -> [A-Z] {% pp.upper %}
alpha -> (lower | upper) {% pp.alpha %}

lword -> lower:+ {% pp.word %}
ufirst -> upper alpha:* {% pp.ufirst %}
word -> alpha:+ {% pp.word %}

before[X, D] -> $D $X {% pp.head %}
after[X, D] -> $X $D {% pp.nth(1) %}

between[OPEN, CLOSE, D] -> $OPEN $D $CLOSE {% pp.between %}
around[Y, X, Z] -> $X $Y $Z {% pp.around %}

parens[D] -> between["(", ")", $D] {% pp.head2 %}
brackets[D] -> between["[", "]", $D] {% pp.head2 %}
curlies[D] -> between["{", "}", $D] {% pp.head2 %} 
angles[D] -> between["<", ">", $D] {% pp.head2 %} 

delim0[SEP, D] -> $D ($SEP $D):* {% pp.delim %}
delim1[SEP, D] -> $D ($SEP $D):+ {% pp.delim %}

# for testing
_between -> between["(", ")", word] {% pp.head %}
_parens -> parens[word] {% pp.head %}
_delim1 -> delim1[",", word] {% pp.head %}

