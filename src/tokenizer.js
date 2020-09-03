function tokenize(code) {
  const regexes = provideRegexes();
  const tokens = listMatches(code, regexes.lexicalElementsRegex);

  return tokens.map(token => ({
    token: token,
    type:
      regexes.keywordRegex         .test(token) ? 'keyword'         : // keyword test must
      regexes.symbolRegex          .test(token) ? 'symbol'          : // precede identifier
      regexes.integerConstantRegex .test(token) ? 'integerConstant' : // and stringConstant
      regexes.stringConstantRegex  .test(token) ? 'stringConstant'  : // must precede identifier
      regexes.identifierRegex      .test(token) ? 'identifier'      :
      null,
  }));
}

function listMatches(string, regex) {
  const result = [];
  for (let i = 0; i < string.length;) {
    const match = string.substring(i).match(regex);
    if (!match) return result;
    result.push(match[0]);
    i += match.index + match[0].length;
  }

  return result;
}

const testString = `class Main {
  function void main() {
      var Array a;
      var int length;
      var int i, sum;

let length = Keyboard.readInt("HOW MANY NUMBERS? ");
let a = Array.new(length);
let i = 0;

while (i < length) {
    let a[i] = Keyboard.readInt("ENTER THE NEXT NUMBER: ");
    let i = i + 1;
}

let i = 0;
let sum = 0;

while (i < length) {
    let sum = sum + a[i];
    let i = i + 1;
}

do Output.printString("THE AVERAGE IS: ");
do Output.printInt(sum / length);
do Output.println();

return;
  }
}`
