var express     	= require('express')
var AdmZip      	= require('adm-zip')
var fs          	= require('fs')
var path        	= require('path')
var alphanumSort	= require('./alphanum').alphanumSort;
var argv        	= require('yargs').argv;

var app = express();
var ziplist = null;

var config = {
	archive : argv.archive
}

function getZipList(callback){
	if(ziplist) return callback(ziplist);
	var directory = config.archive;
	fs.readdir(directory, function(err, contents){
		if(err) return callback(ziplist = []);
		contents = contents.sort().map(function(fileName){
			if(!/\.zip$/.test(fileName)) return null;
			var stats = fs.statSync(path.join(directory, fileName))
			if(!stats.isFile()) return null;
			return {
				fileName: fileName,
				fullName: path.join(directory, fileName),
				mdate: stats.mdate
			}
		}).filter(function(x){ return !!x });
		ziplist = contents;
		return callback(ziplist);
	})
};

app.get('/image/:bid/:page', function (req, res) {
	getZipList(function(zl){
		var zf = new AdmZip(zl[req.params.bid].fullName).getEntries();
		for(var j = 0; j < zf.length; j++){
			if(zf[j].entryName === req.params.page) {
				zf[j].getDataAsync(function(buf){
					res.status(200).write(buf);
					res.end();					
				});
				return
			}
		}
		res.status(404).send('Image not found.');
	})
});

app.get('/pages/:bid', function (req, res) {
	getZipList(function(zl){
		try {
			var zf = new AdmZip(zl[req.params.bid].fullName).getEntries().map(function(entry){ return entry.entryName });
			res.status(200).set('Content-Type', 'text/html');
			res.write('<ol>' + alphanumSort(zf).map(function(x){ return '<li><img src="/image/' + req.params.bid + '/' + x + '" width=100 height=100/></li>' }).join('\n') + '</ol>');
			res.end();
		} catch(e){
			res.status(500).send(e + '').end();
		}
	})
});

app.get('/', function (req, res) {
	getZipList(function(zl){
		res.set('Content-Type', 'text/html');
		res.send('<ol>' + zl.map(function(entry, bid){ return '<li><a href="/pages/' + bid + '">' + entry.fileName + '</a></li>'}).join('\n') + '</ol>')
	})
});

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('[init] LocalHT listening at http://%s:%s', host, port);
	console.log('[init] LocalHT Archive is %s', config.archive);
})