var express	= require('express')
var zipfile	= require('zipfile')
var fs     	= require('fs')
var path   	= require('path')
var alphanumSort = require('./alphanum').alphanumSort;

var app = express();
var ziplist = null;

function getZipList(callback){
	if(ziplist) return callback(ziplist);
	var directory = 'D:\\LHTArchive'
	fs.readdir(directory, function(err, contents){
		if(err) return res.status(404).send('LHT Archive not accessable.');
		contents = contents.filter(function(file){ return /\.zip$/.test(file) && fs.statSync(path.join(directory, file)).isFile()}).sort().map(function(fileName){
			return {
				fileName : fileName,
				fullName : path.join(directory, fileName)
			}
		});
		ziplist = contents;
		return callback(ziplist);
	})
};

app.get('/image/:bid/:page', function (req, res) {
	getZipList(function(zl){
		var zf = new zipfile.ZipFile(zl[req.params.bid].fullName);
		zf.readFile(req.params.page, function(err, buffer){
			if(!err){
				res.write(buffer);
				res.end();
			} else {
				res.status(404).send('Image not found.');
			}
		})
	})
});

app.get('/pages/:bid', function (req, res) {
	getZipList(function(zl){
		var zf = new zipfile.ZipFile(zl[req.params.bid].fullName);
		res.status(200).set('Content-Type', 'text/html');
		res.write('<ol>' + alphanumSort(zf.names).map(function(x){ return '<li><img src="/image/' + req.params.bid + '/' + x + '" width=100 height=100/></li>' }).join('\n') + '</ol>');
		res.end();
	})
});

app.get('/all', function (req, res) {
	getZipList(function(zl){
		res.set('Content-Type', 'text/html');
		res.send('<ol>' + zl.map(function(entry, bid){ return '<li><a href="/pages/' + bid + '">' + entry.fileName + '</a></li>'}).join('\n') + '</ol>')
	})
});

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('LocalHT listening at http://%s:%s', host, port)
})