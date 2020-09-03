// accepts an array of objects with token and type attributes
function parse(tokens) {
  const parseObject = {
    currentIndex: 0,
    tokens: tokens,
  }

  const regexes = provideRegexes();
  return eatClass(parseObject, regexes);
}

/////////////////////// PROGRAM STRUCTURE ///////////////////////

function eatClass(parseObject, regexes) {
  const classString    =        eatKeyword(parseObject, regexes);
  const className      =     eatIdentifier(parseObject, regexes);
  const openBrace      =         eatSymbol(parseObject, regexes);
  const classVarDecs   =   eatClassVarDecs(parseObject, regexes);
  const subroutineDecs = eatSubroutineDecs(parseObject, regexes);
  const closeBrace     =         eatSymbol(parseObject, regexes);

  if (classString.token !== 'class' || openBrace.token !== '{' || closeBrace.token !== '}')
    throwError(parseObject);

  return {
    classString,
    className,
    openBrace,
    classVarDecs,
    subroutineDecs,
    closeBrace,
  };
}

function eatClassVarDecs(parseObject, regexes) {
  const beginningOfClassVarDec = /static|field/;
  const varDecs = [];
  while (beginningOfClassVarDec.test(currentToken(parseObject)))
    varDecs.push(eatClassVarDec(parseObject, regexes));

  return varDecs;
}

function eatClassVarDec(parseObject, regexes) {
  const mainVariableType =  eatKeyword(parseObject, regexes);
  const type             =     eatType(parseObject, regexes);
  const varNames         = eatVarNames(parseObject, regexes);
  const endSemicolon     =   eatSymbol(parseObject, regexes);

  if (!(mainVariableType.token === 'static' || mainVariableType.token === 'field') || endSemicolon.token !== ';')
    throwError(parseObject);

  return {
    mainVariableType,
    type,
    varNames,
    endSemicolon,
  }
}

function eatSubroutineDecs(parseObject, regexes) {
  const beginningOfSubroutineDec = /constructor|function|method/;
  const subroutineDecs = [];
  while (beginningOfSubroutineDec.test(currentToken(parseObject)))
    subroutineDecs.push(eatSubroutineDec(parseObject, regexes));

  return subroutineDecs;
}

function eatSubroutineDec(parseObject, regexes) {
  const mainSubroutineType =        eatKeyword(parseObject, regexes);
  const subroutineType     = eatSubroutineType(parseObject, regexes);
  const subroutineName     =     eatIdentifier(parseObject, regexes);
  const openParen          =         eatSymbol(parseObject, regexes);
  const paramaterList      =  eatParameterList(parseObject, regexes);
  const closeParen         =         eatSymbol(parseObject, regexes);
  const subroutineBody     = eatSubroutineBody(parseObject, regexes);

  if (!(mainSubroutineType.token === 'constructor' || mainSubroutineType.token === 'function' || mainSubroutineType.token === 'method')
    || openParen.token !== '(' || closeParen.token !== ')')
    throwError(parseObject);

  return {
    mainSubroutineType,
    subroutineType,
    subroutineName,
    openParen,
    paramaterList,
    closeParen,
    subroutineBody,
  }
}

function eatSubroutineType(parseObject, regexes) {
  return /void|int|char|boolean/.test(currentToken(parseObject)) ?
    eatKeyword(parseObject, regexes) : eatIdentifier(parseObject, regexes);
}

function eatType(parseObject, regexes) {
  const tokenType = parseObject.tokens[parseObject.currentIndex].type;
  const type = tokenType === 'keyword' ?
    eatKeyword(parseObject, regexes) : eatIdentifier(parseObject, regexes);

  if (tokenType.token === 'keyword' && !(type.token === 'int' || type.token === 'char' || type.token === 'boolean'))
    throwError(parseObject);

  return type;
}

function eatVarNames(parseObject, regexes) {
  const varNames = [eatIdentifier(parseObject, regexes)];

  while(currentToken(parseObject) === ',') {
    varNames.push(eatSymbol(parseObject, regexes));
    varNames.push(eatIdentifier(parseObject, regexes));
  }

  return varNames;
}

function eatParameterList(parseObject, regexes) {
  const parameters = [];

  if (regexes.keywordRegex.test(currentToken(parseObject))) {
    parameters.push(eatType(parseObject, regexes));
    parameters.push(eatIdentifier(parseObject, regexes));
    while(currentToken(parseObject) === ',') {
      parameters.push(eatSymbol(parseObject, regexes));
      parameters.push(eatType(parseObject, regexes));
      parameters.push(eatIdentifier(parseObject, regexes));
    }
  }

  return parameters;
}

function eatSubroutineBody(parseObject, regexes) {
  const openBrace  =     eatSymbol(parseObject, regexes);
  const varDecs    =    eatVarDecs(parseObject, regexes);
  const statements = eatStatements(parseObject, regexes);
  const closeBrace =     eatSymbol(parseObject, regexes);

  if (openBrace.token !== '{' || closeBrace.token !== '}') throwError(parseObject);

  return {
    openBrace,
    varDecs,
    statements,
    closeBrace,
  }
}

function eatVarDecs(parseObject, regexes) {
  const varDecs = [];

  while (currentToken(parseObject) === 'var')
    varDecs.push(eatVarDec(parseObject, regexes));

  return varDecs;
}

function eatVarDec(parseObject, regexes) {
  const varString = eatKeyword(parseObject, regexes);
  const type = eatType(parseObject, regexes);

  const varNames = [eatIdentifier(parseObject, regexes)];
  while (currentToken(parseObject) === ',') {
    varNames.push(eatSymbol(parseObject, regexes));
    varNames.push(eatIdentifier(parseObject, regexes));
  }

  const endSemicolon = eatSymbol(parseObject, regexes);

  if (varString.token !== 'var' || endSemicolon.token !== ';')
    throwError(parseObject);

  return {
    varString,
    type,
    varNames,
    endSemicolon,
  }
}

/////////////////////// STATEMENTS ///////////////////////

function eatStatements(parseObject, regexes) {
  const statements = [];
  while (/let|if|while|do|return/.test(currentToken(parseObject)))
    statements.push(eatStatement(parseObject, regexes));

  return statements;
}

function eatStatement(parseObject, regexes) {
  const currToken = currentToken(parseObject);
  return currToken === 'let'   ?   eatLetStatement(parseObject, regexes):
    currToken      === 'if'    ?    eatIfStatement(parseObject, regexes):
    currToken      === 'while' ? eatWhileStatement(parseObject, regexes):
    currToken      === 'do'    ?    eatDoStatement(parseObject, regexes):
                                eatReturnStatement(parseObject, regexes);
}

function eatLetStatement(parseObject, regexes) {
  const letString = eatKeyword(parseObject, regexes);
  const varName = eatIdentifier(parseObject, regexes);

  let openBracket, arrayIndex, closeBracket;
  if (currentToken(parseObject) === '[') {
    openBracket  =     eatSymbol(parseObject, regexes);
    arrayIndex   = eatExpression(parseObject, regexes);
    closeBracket =     eatSymbol(parseObject, regexes);

    if (closeBracket.token !== ']') throwError(parseObject);
  }

  const equalsSign   =     eatSymbol(parseObject, regexes);
  const expression   = eatExpression(parseObject, regexes);
  const endSemicolon =     eatSymbol(parseObject, regexes);

  if (equalsSign.token !== '=' || endSemicolon.token !== ';') throwError(parseObject);

  return openBracket ? {
    letString,
    varName,
    openBracket,
    arrayIndex,
    closeBracket,
    equalsSign,
    expression,
    endSemicolon,
  } : {
    letString,
    varName,
    equalsSign,
    expression,
    endSemicolon,
  };
}

function eatIfStatement(parseObject, regexes) {
  const ifString   =    eatKeyword(parseObject, regexes);
  const openParen  =     eatSymbol(parseObject, regexes);
  const expression = eatExpression(parseObject, regexes);
  const closeParen =     eatSymbol(parseObject, regexes);
  const openBrace  =     eatSymbol(parseObject, regexes);
  const statements = eatStatements(parseObject, regexes);
  const closeBrace =     eatSymbol(parseObject, regexes);

  const elseStatement = currentToken(parseObject) === 'else' ?
    eatElseStatement(parseObject, regexes) : null;

  return elseStatement ? {
    ifString,
    openParen,
    expression,
    closeParen,
    openBrace,
    statements,
    closeBrace,
    elseStatement,
  } : {
    ifString,
    openParen,
    expression,
    closeParen,
    openBrace,
    statements,
    closeBrace,
  };
}

function eatElseStatement(parseObject, regexes) {
  const elseString =    eatKeyword(parseObject, regexes);
  const openBrace  =     eatSymbol(parseObject, regexes);
  const statements = eatStatements(parseObject, regexes);
  const closeBrace =     eatSymbol(parseObject, regexes);

  if (openBrace.token !== '{' || closeBrace.token !== '}') throwError(parseObject);

  return {
    elseString,
    openBrace,
    statements,
    closeBrace,
  }
}

function eatWhileStatement(parseObject, regexes) {
  const whileString =    eatKeyword(parseObject, regexes);
  const openParen   =     eatSymbol(parseObject, regexes);
  const expression  = eatExpression(parseObject, regexes);
  const closeParen  =     eatSymbol(parseObject, regexes);
  const openBrace   =     eatSymbol(parseObject, regexes);
  const statements  = eatStatements(parseObject, regexes);
  const closeBrace  =     eatSymbol(parseObject, regexes);

  if (openParen.token !== '(' || closeParen.token !== ')' || openBrace.token !== '{' || closeBrace.token !== '}')
    throwError(parseObject);

  return {
    whileString,
    openParen,
    expression,
    closeParen,
    openBrace,
    statements,
    closeBrace,
  };
}

function eatDoStatement(parseObject, regexes) {
  const doString       =        eatKeyword(parseObject, regexes);
  const subroutineCall = eatSubroutineCall(parseObject, regexes);
  const endSemicolon   =         eatSymbol(parseObject, regexes);

  if (endSemicolon.token !== ';') throwError(parseObject);

  return {
    doString,
    subroutineCall,
    endSemicolon,
  };
}

function eatReturnStatement(parseObject, regexes) {
  const returnString = eatKeyword(parseObject, regexes);

  const expression = currentToken(parseObject) === ';' ?
    null : eatExpression(parseObject, regexes);

  const endSemicolon = eatSymbol(parseObject, regexes);

  if (endSemicolon.token !== ';') throwError(parseObject);

  return expression ? {
    returnString,
    expression,
    endSemicolon,
  } : {
    returnString,
    endSemicolon,
  };
}

/////////////////////// EXPRESSIONS ///////////////////////

function eatExpression(parseObject, regexes) {
  const term = eatTerm(parseObject, regexes);

  const extraTerms = [];
  while (/\+|-|\*|\/|&|\||<|>|=/.test(currentToken(parseObject))) {
    extraTerms.push(eatOperation(parseObject, regexes));
    extraTerms.push(eatTerm(parseObject, regexes));
  }

  return extraTerms ? {
    term,
    extraTerms,
  } : term;
}

function eatTerm(parseObject, regexes) {
  let term;

  if (currentTokenType(parseObject) === 'integerConstant')
    term = eatIntegerConstant(parseObject, regexes);

  else if (currentTokenType(parseObject) === 'stringConstant')
    term = eatStringConstant(parseObject, regexes);

  else if (currentTokenType(parseObject) === 'keyword')
    term = eatKeyword(parseObject, regexes);

  // test if we have unaryOp term
  else if (/-|~/.test(currentToken(parseObject))) {
    const unaryOp = eatSymbol(parseObject, regexes);

    term = {
      unaryOp,
      term: eatTerm(parseObject, regexes),
    };
  }

  // test if we have the form varName[expression]
  else if (nextToken(parseObject) === '[') {
    const varName      = eatIdentifier(parseObject, regexes);
    const openBracket  =     eatSymbol(parseObject, regexes);
    const expression   = eatExpression(parseObject, regexes);
    const closeBracket =     eatSymbol(parseObject, regexes);

    term = {
      varName,
      openBracket,
      expression,
      closeBracket,
    };
  }

  // test if we have (expression)
  else if (currentToken(parseObject) === '(') {
    const openParen  =     eatSymbol(parseObject, regexes);
    const expression = eatExpression(parseObject, regexes);
    const closeParen =     eatSymbol(parseObject, regexes);

    term = {
      openParen,
      expression,
      closeParen,
    };
  }

  // test if we have subroutineCall
  else if (nextToken(parseObject) === '(' || nextToken(parseObject) === '.')
    term = eatSubroutineCall(parseObject, regexes);

  // if all the above fail, we must have varName
  else term = eatIdentifier(parseObject, regexes);

  return term;
}

function eatOperation(parseObject, regexes) {
  const operation = eatSymbol(parseObject, regexes);

  if (!/\+|-|\*|\/|&|\||<|>|=/.test(operation.token)) throwError(parseObject);

  return operation;
}

function eatUnaryOperation(parseObject, regexes) {
  const operation = eatSymbol(parseObject, regexes);

  if (!/-|~/.test(operation.token)) throwError(parseObject);

  return operation;
}

function eatKeywordConstant(parseObject, regexes) {
  const keyword = eatKeyword(parseObject, regexes);

  if (!/true|false|null|this/.test(keyword.token)) throwError(parseObject);

  return keyword;
}

function eatSubroutineCall(parseObject, regexes) {
  let subroutineCall;

  if (nextToken(parseObject) === '(') {
    const subroutineName =     eatIdentifier(parseObject, regexes);
    const openParen      =         eatSymbol(parseObject, regexes);
    const expressionList = eatExpressionList(parseObject, regexes);
    const closeParen     =         eatSymbol(parseObject, regexes);

    subroutineCall = {
      subroutineName,
      openParen,
      expressionList,
      closeParen,
    };
  } else {
    const name           =     eatIdentifier(parseObject, regexes);
    const dot            =         eatSymbol(parseObject, regexes);
    const subroutineName =     eatIdentifier(parseObject, regexes);
    const openParen      =         eatSymbol(parseObject, regexes);
    const expressionList = eatExpressionList(parseObject, regexes);
    const closeParen     =         eatSymbol(parseObject, regexes);

    subroutineCall = {
      name,
      dot,
      subroutineName,
      openParen,
      expressionList,
      closeParen,
    };
  }

  return subroutineCall;
}

function eatExpressionList(parseObject, regexes) {
  if (currentToken(parseObject) === ')') return null;

  const expression = eatExpression(parseObject, regexes);

  const expressions = [];
  while(currentToken(parseObject) === ',') {
    expressions.push(eatSymbol(parseObject, regexes));
    expressions.push(eatExpression(parseObject, regexes));
  }

  return expressions ? {
    expression,
    expressions,
  } : expression;
}

/////////////////////// LEXICAL ELEMENTS ///////////////////////

function eatKeyword(parseObject, regexes) {
  return eatTerminalToken(parseObject, regexes.keywordRegex)
}

function eatSymbol(parseObject, regexes) {
  return eatTerminalToken(parseObject, regexes.symbolRegex)
}

function eatIntegerConstant(parseObject, regexes) {
  return eatTerminalToken(parseObject, regexes.integerConstantRegex)
}

function eatStringConstant(parseObject, regexes) {
  return eatTerminalToken(parseObject, regexes.stringConstantRegex);
}

function eatIdentifier(parseObject, regexes) {
  return eatTerminalToken(parseObject, regexes.identifierRegex)
}

function eatTerminalToken(parseObject, regex) {
  if (regex.test(currentToken(parseObject)))
    return parseObject.tokens[parseObject.currentIndex++];

  else throwError(parseObject);
}

/////////////////////// HELPER FUNCTIONS ///////////////////////

function currentToken(parseObject) {
  return parseObject.tokens[parseObject.currentIndex].token;
}

function nextToken(parseObject) {
  return parseObject.tokens[parseObject.currentIndex + 1].token;
}

function currentTokenType(parseObject) {
  return parseObject.tokens[parseObject.currentIndex].type;
}

function throwError(parseObject) {
  console.log(parseObject.currentIndex);
  console.log(currentToken(parseObject), nextToken(parseObject));
  throw Error;
}
