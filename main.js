document.getElementById('fileInput').addEventListener('change', function() {
  const files = getJackfiles(this.files);

  if (files.length === 0) {
    alert("Sorry, ya gotta have .jack files.");
    return;
  }

  const directoryName = getDirectoryName(this.files);

  const codeFromFiles = [];
  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();

    reader.onload = () => {
      codeFromFiles.push(reader.result);

      if (i === files.length - 1) {
        const fileNames = files.map(file => file.name.substring(0, file.name.indexOf('.')));
        codeFromFiles.forEach((file, index) => download(fileNames[index] + '.hack', compileFile(file)));
      }
    }

    reader.readAsText(files[i]);
  }
});

document.getElementById('inputCode').addEventListener('click', function() {
  const codeInput = document.getElementById('codeInput').value;
  console.log(codeInput);
  if (codeInput !== '') download('program.hack', compileFile(codeInput));
});

//////////////////////////////////////

function getDirectoryName(uploadedContent) {
  const relativePath = uploadedContent[0].webkitRelativePath;
  return relativePath.substring(0, relativePath.indexOf('/'));
}

function getJackfiles(files) {
  const result = [];
  for (let i = 0; i < files.length; i++)
    if (getFileExtension(files[i].name) === '.jack')
      result.push(files[i]);
  return result;
}

function getFileExtension(fileName) {
  return fileName.substring(fileName.indexOf('.'));
}

//////////////////////////////////////

function download(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

//////////////////////////////////////

function compileFile(fileText) {
  return analyzeSyntax(fileText);
}

function analyzeSyntax(fileText) {
  return JSON.stringify(parse(tokenize(stripWhitespace(fileText))), null, 2);
}
