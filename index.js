var express	= require('express')
var zipfile	= require('zipfile')
var fs     	= require('fs')
var alphanumSort = require('./alphanum').alphanumSort;

var app = express()

app.get('/book/:file', function (req, res) {
	var zf = new zipfile.ZipFile('D:\\LHTArchive\\1.zip');
	zf.readFile(req.params.file, function(err, buffer){
		if(!err){
			res.write(buffer);
			res.end();
		} else {
			res.status(404).send('Not found');
		}
	})
});

app.get('/list', function (req, res) {
	var zf = new zipfile.ZipFile('D:\\LHTArchive\\1.zip');
	res.status(200).set('Content-Type', 'text/html');
	res.write('<ol>' + alphanumSort(zf.names).map(function(x){ return '<li><img src="/book/' + x + '" width=100 height=100/></li>' }).join('\n') + '</ol>');
	res.end();
});

var server = app.listen(3000, function () {

	var host = server.address().address
	var port = server.address().port

	console.log('Example app listening at http://%s:%s', host, port)

})