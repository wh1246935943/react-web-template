let fs = require('fs');
let os = require('os');
let path = require('path');
let exec = require('child_process').exec;

const platform = os.platform();

/**
 * 删除指定的文件夹及其内容
 * @param { string } dirPath - 要删除的文件夹路径
 */
function removeDir(dirPath) {
  try {
    let statObj = fs.statSync(dirPath);

    if (statObj.isDirectory()) {
      //如果是目录
      let dirs = fs.readdirSync(dirPath);

      dirs = dirs.map((dir) => path.join(dirPath, dir));

      for (let i = 0; i < dirs.length; i++) {
        removeDir(dirs[i]);
      }

      fs.rmdirSync(dirPath); //删除目录
    } else {
      fs.unlinkSync(dirPath); //删除文件
    }
  } catch (error) {}
}

/**
 * 判断目标文件是否为文件夹
 * @param { dir_path } filepath 目标文件的路径
 * @returns { boolean }
 */
function isDir(filepath) {
  try {
    let stat = fs.statSync(filepath);
    return stat.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * 查找指定名字文件夹路径
 * @param { Object } params - 参数对象
 * @param { string } params.dirName - 文件夹名
 * @param { string } params.dirPath - 开始的文件夹目录，（开始从那个文件夹中查找目标文件夹）
 * @param { boolean } [params.isVague] - 是否模糊查询
 * @param { boolean } [params.isOpen] - 找到后是否打开目录并选中, 目前支持win系统
 * @param { Array<string> } [params.exclude] - 除外的文件夹，指那些文件夹不需要查找目标文件夹
 * @param { Function } [callback] - 成功后的回调的事件
 * @return { string } 目标文件夹的路径
 */
function findTargetFile(params = {}, callback) {
  const {
    dirName,
    dirPath,
    isVague = true,
    isOpen = false,
    exclude = [],
  } = params;
  let list = [];
  /**
   * 如果递归的目录不存在则结束查询
   */
  try {
    list = fs.readdirSync(dirPath, {
      encoding: 'utf8',
      withFileTypes: true,
    });
  } catch (error) {
    console.log('初始目录不存在，查找已经终止:::', dirPath);
    return;
  }

  const { length } = list;

  for (let index = 0; index < length; index++) {
    const { name } = list[index];
    /**
     * 在排除的目录之外的目录中查找
     */
    if (exclude.includes(name)) continue;
    /**
     * path.join方法可以根据不统平台的路径分隔符号来拼接
     */
    const filePath = path.join(dirPath, name);
    /**
     * 判断是否为文件夹
     */
    if (isDir(filePath)) {
      let isFound = false;
      /**
       * 精确查找还是模糊查找
       */
      if (isVague && name.includes(dirName)) {
        isFound = true;
      } else if (name === dirName) {
        isFound = true;
      }
      /**
       * 找到后判断平台做响应的操作
       */
      if (isFound) {
        if (isOpen && platform === 'win32') {
          exec(`explorer.exe /select, "${filePath}"`);
        }

        if (typeof callback === 'function') callback(filePath);

        return;
      }

      findTargetFile(
        {
          ...params,
          dirPath: filePath,
        },
        callback,
      );
    }
  }
}

findTargetFile(
  {
    dirName: '.umi-production', //删除文件夹的文件夹
    dirPath: __dirname,
    exclude: ['node_modules'],
  },
  removeDir.bind(null),
);
