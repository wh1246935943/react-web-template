var chokidar = require('chokidar');
var fs = require('fs');

var log = console.log.bind(console);

const temp =
  'export default {\n' +
  "  'GET /army/pcweb/xxxxx/xxxxx': (req, res) => {\n" +
  '    res.json({})\n' +
  '  }\n' +
  '}';

var watcher = chokidar.watch('src/service/module', {
  persistent: true,
});

watcher
  .on('add', function (path) {
    log('add');
    const mockpath = ['mock']
      .concat(path.split('\\').splice(3))
      .join('/')
      .replace('.ts', '.js');

    fs.exists(mockpath, function (exists) {
      if (!exists) {
        fs.writeFile(mockpath, temp, function () {});
      }
    });
  })
  .on('addDir', function (path) {
    log('addDir');
    const mockpath = ['mock'].concat(path.split('\\').splice(3)).join('/');

    mkdirs(mockpath, function () {});
  });

function mkdirs(dirpath, _callback) {
  var dirArray = dirpath.split('/');

  fs.exists(dirpath, function (exists) {
    if (!exists) {
      mkdir(0, dirArray, function () {
        _callback();
      });
    } else {
      _callback();
    }
  });
}

function mkdir(pos, dirArray, _callback) {
  var len = dirArray.length;
  log(len);
  if (pos >= len || pos > 10) {
    _callback();
    return;
  }
  var currentDir = '';
  for (var i = 0; i <= pos; i++) {
    if (i != 0) currentDir += '/';
    currentDir += dirArray[i];
  }
  fs.exists(currentDir, function (exists) {
    if (!exists) {
      fs.mkdir(currentDir, function (err) {
        if (err) {
          // ...
        } else {
          mkdir(pos + 1, dirArray, _callback);
        }
      });
    } else {
      mkdir(pos + 1, dirArray, _callback);
    }
  });
}
