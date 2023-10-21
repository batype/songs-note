const { exec } = require('child_process');
const fs = require('fs');
let version;
function updateVersion() {
    fs.readFile('package.json', 'utf8', (err, data) => {
        if (err) {
          throw new Error(`读取文件时发生错误: ${err}`);
        }

        let package = JSON.parse(data);
        version = package.version;
        let versionArr = String(package.version).split(',');

        versionArr[versionArr.length] = Number(versionArr[versionArr.length]) + 1;
        package.version = versionArr.join(',');

        fs.writeFile('package.json', JSON.stringify(package), (err, data) => {
            if (err) {
                throw new Error(`写入文件时发生错误: ${err}`);
            }
            console.log(`版本从${version}， 更新至${package.version}`);
            version = package.version;
        });
      });
}

updateVersion();

exec(`git add . && git commit -m "update version ${version}"`, (err, data) => {
    if (err) {
        throw new Error(`git commit error: ${err}`);
    }
});

exec('npm run build && gh-pages -d public', (err, data) => {
    if (err) {
        throw new Error(`npm run release error: ${err}`);
    }
    console.log(`版本${version}发布成功！`);
    updateGiteePages();
});

function updateGiteePages() {
    
    const request = fetch('https://gitee.com/batype/songs-note/pages/rebuild', {
        method: 'POST', // 设置请求方法为POST
        headers: {
          'Content-Type': 'application/json', // 设置请求头信息
        },
        body: JSON.stringify(
            {
                branch: 'gh-pages',
                build_directory: '',
                force_https: true,
                auto_update: false
            }), // 将要发送的数据转换为JSON字符串
      });

      request.then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // 解析响应数据为JSON对象
      }).then(res => {
        console.log('Gitee update Pages request is OK!');
      }).catch(err => {
        throw new Error(err);
      })
}
