// needs to handle inline comments beginning with '//', as well as
// multiline comments beginning with '/**' and ending with '*/'
function stripWhitespace(code) {
  let result = '';

  let inComment = false;
  for (let i = 0; i < code.length; i++) {
    if (code.substring(i, i + 3) === '/**' && !inComment)
      inComment = true;

    if (code.substring(i - 2, i) === '*/' && inComment)
      inComment = false;

    if (!inComment) result += code[i];
  }

  return result.split(/\r|\n/).map(removeInlineComments).join('\n');
}

function removeInlineComments(line) {
  const removeComments = line.includes('//') ?
    line.substring(0, line.indexOf('//')):
    line;
  return removeComments;
}
