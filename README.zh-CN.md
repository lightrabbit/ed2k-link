# ed2k-link

用于生成,解析ed2k链接的Node.js模块

[![NPM](https://nodei.co/npm/ed2k-link.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/ed2k-link)

## 安装
你可以通过输入以下命令来安装该模块

    npm install ed2k-link

## 使用
你需要先将该模块引用到你的代码当中:
```JavaScript
ed2k = require('ed2k-link');
```

## 类

我英文不好(其实是懒),所以这边只写了中文版,哪位哥们有兴趣能帮忙翻译下,多谢了!

### ed2k.Ed2kLink
`Ed2kLink`类用于描述一个ed2k链接,该类拥有对电骡的ed2k链接所有的特性的完整定义.
此类可以通过new的形式创建,也可通过`ed2k.parse(url)`的方式从ed2k链接构建.
还可以通过调用`ed2k.generate(filename)`来对文件生成ed2k链接.

#### 成员变量

|成员名|类型|说明|
|:----|----|----:|
|filename|String|文件名|
|length|Number|文件大小|
|ed2k|String|ed2k Hash|
|aich|String|AICH Hash|
|hashset|String[]|Hashset|
|sources.client|String[]|文件的电骡客户端来源|
|sources.url|String[]|基于url的资源,如http的下载地址(电骡可能只支持http协议)|

#### 成员方法

##### link.toString(option)
将解析后的类重新转为ed2k链接,其中`option`选项用于设置是否在链接中包含hashset.
当`option.hashset=true`时,将在生成的链接中包含hashset.

### ed2k.Ed2kLinkHash
`Ed2kLinkHash`继承于`stream.Transform`,并且拥有类似`crypto.Hash`的方法.
可以将它作为可写流,对其写入数据,接着注册它的`finish`事件,当写入结束的时候,
就可以从`hash.link`中得到`Ed2kLink`对象.它和`crypto.Hash`唯一不同的地方在于:
当你调用`digest()`的时候,返回的是一个`Ed2kLink`对象,而不是`Buffer`对象.

PS:详细参考`ed2k.generate`的具体实现



## 例子

#### 解析一条ed2k链接

代码:
```JavaScript
ed2k.parse("ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/");
```
输出:
```Javascript
{ filename: 'foo.bar',
  ed2k: '0123456789ABCDEF0123456789ABCDEF',
  aich: '',
  hashset: [],
  sources: { client: [], url: [] },
  length: 123 }
```

#### 将 `Ed2kLink` 转换为ed2k链接字符串

Code:
```JavaScript
var link = ed2k.parse("ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|p=FEDCBA98765432100123456789ABCDEF:0123456789ABCDEFFEDCBA9876543210|/");
link.toString();
link.toString({ hashset : true });
```
Output:
```
ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|/
ed2k://|file|foo.bar|123|0123456789ABCDEF0123456789ABCDEF|p=FEDCBA98765432100123456789ABCDEF:0123456789ABCDEFFEDCBA9876543210|/
```

#### 从现有文件中生成`Ed2kLink`对象:

Code:

```JavaScript
//node.js 风格的回调方式
ed2k.generate("./foo.bar", function(err, link) {
  console.log(link);
});
//Promise 风格的回调方式
ed2k.generate("./foo.bar").then(function(link) {
  console.log(link);
});
//也可以用ES6 Generator + co库的方式
co(function *() {
  console.log(yield ed2k.generate("./foo.bar"));
});
```
Output:
```Javascript
{ filename: 'foo.bar',
  ed2k: '0123456789ABCDEF0123456789ABCDEF',
  aich: '',
  hashset: [],
  sources: { client: [], url: [] },
  length: 123 }
```


## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).

## Contact
Author: lightpacerabbit@gmail.com