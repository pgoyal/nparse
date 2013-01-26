var fs            = require('fs'),
    StringDecoder = require('string_decoder').StringDecoder,
    util          = require('util');



function lineByLine(fd) {
  var blob = '';
  var blobStart = 0;
  var blobEnd = 0;

  var decoder = new StringDecoder('utf8');

  var CHUNK_SIZE = 16384;
  var chunk = new Buffer(CHUNK_SIZE);

  var eolPos = -1;
  var lastChunk = false;

  var moreLines = true;
  var readMore = true;

  // each line
  while (moreLines) {

    readMore = true;
    // append more chunks from the file onto the end of our blob of text until we have an EOL or EOF
    while (readMore) {

      // do we have a whole line? (with LF)
      eolPos = blob.indexOf('\n', blobStart);

      if (eolPos !== -1) {
        blobEnd = eolPos;
        readMore = false;

      // do we have the last line? (no LF)
      } else if (lastChunk) {
        blobEnd = blob.length;
        readMore = false;

      // otherwise read more
      } else {
        var bytesRead = fs.readSync(fd, chunk, 0, CHUNK_SIZE, null);

        lastChunk = bytesRead !== CHUNK_SIZE;

        // TODO blob grows until memory is exhausted!
        blob += decoder.write(chunk.slice(0, bytesRead));
      }
    }

    if (blobStart < blob.length) {
      processLine(blob.substring(blobStart, blobEnd + 1));

      blobStart = blobEnd + 1;

      if (blobStart >= CHUNK_SIZE) {
        // blobStart is in characters, CHUNK_SIZE is in octets
        var freeable = blobStart / CHUNK_SIZE;

        blob = blob.substring(CHUNK_SIZE);
        blobStart -= CHUNK_SIZE;
        blobEnd -= CHUNK_SIZE;
      }
    } else {
      moreLines = false;
    }
  }
}

fd = fs.openSync('log.txt', 'r');


var lineidx=0;
lineByLine(fd);

function processLine(line)
{
	var i, j;
	var tokens = new Array();;
	lineidx++;

	j=0;
	tokens[0] = "";
    process.stdout.write("processing log line number:" + lineidx + "\n");
    for (i=0; i<line.length; i++)
    {
		if (line[i] == ' ') {
		    // new token
		    j++;
		    tokens[j] = "";
		    continue;
		} else if (line[i] == '"'){
			var k;
		    for (k = i+1; k < line.length; k++)
			{
     			if (line[k] =='"') { i=k; break;}
				tokens[j] = tokens[j] + line[k];
				
			}
		} else if (line[i] == '['){
			var k;
		    for (k = i+1; k < line.length; k++)
			{
     			if (line[k] ==']') { i=k; break;}
				tokens[j] = tokens[j] + line[k];
				
			}
		} else {
			tokens[j] = tokens[j] + line[i];
		}
    }
	process.stdout.write("Tokens found " + j + "\n");
	process.stdout.write("-----------------------------------------------------\n");
    for (i=0; i<tokens.length; i++) {
	    process.stdout.write(tokens[i] +  "\n");

	}

	
}
