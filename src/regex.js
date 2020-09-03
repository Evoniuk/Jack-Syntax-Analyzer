function provideRegexes() {
  const keywords = [
    'class',
    'constructor',
    'function',
    'method',
    'field',
    'static',
    'var',
    'int',
    'char',
    'boolean',
    'void',
    'true',
    'false',
    'null',
    'this',
    'let',
    'do',
    'if',
    'else',
    'while',
    'return',
  ].join('|');

  const symbols = [
    '\\(',
    '\\)',
    '\\{',
    '\\}',
    '\\[',
    '\\]',
    '\\.',
    ',',
    ';',
    '\\+',
    '-',
    '\\*',
    '/',
    '&',
    '\\|',
    '<',
    '>',
    '=',
    '~',
  ].join('|');

  const integerConstant = '\\d+';
  const stringConstant  = '"[^"]*"';
  const identifier      = '[_A-Za-z]\\w*';

  return {
    keywordRegex:         new RegExp(`${keywords}`),
    symbolRegex:          new RegExp(`${symbols}`),
    integerConstantRegex: new RegExp(`${integerConstant}`),
    identifierRegex:      new RegExp(`${identifier}`),
    stringConstantRegex:  new RegExp(`${stringConstant}`),
    lexicalElementsRegex: new RegExp(`${integerConstant}|${keywords}|${stringConstant}|${identifier}|${symbols}`),
  };
}
