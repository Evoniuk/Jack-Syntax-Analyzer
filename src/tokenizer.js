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
    if (!match) break;
    result.push(match[0]);
    i += match.index + match[0].length;
  }

  return result;
}
