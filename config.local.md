## 打包配置

### l20n-ng打包
    "index": "./example/angular/index.html",
    "main": "./lib/l20n-ng.js",
    "output": {
      "path": "./dist/ng",
      "app": "l20n"
    },

### l20n-native打包
    "index": "./example/native/index.html",
    "main": "./lib/l20n-native.js",
    "output": {
      "path": "./dist/native",
      "app": "l20n"
    },

### l20n-require打包
    "index": "./example/amd/index.html",
    "main": "./lib/l20n-amd.js",
    "output": {
      "path": "./dist/amd",
      "app": "l20n"
    }