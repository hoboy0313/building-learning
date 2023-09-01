# building-learning

本项目用于构建学习，主要使用 `webpack` 、 `rollup` 、 `gulp` 进行构建。

其中,

`demos` 目录是 clone 的 `ant-mobile` 和 `dayjs` 源码，删除了单测，demo 等，只保留了核心部分，方便参照。

`packages` 目录是学习测试使用的目录

- ant-design-mobile 是构建 `antd-mobile`
- dayjs 是构建 `dayjs`
- test 是下载 `antd-mobile` 和 `dayjs` 发布在 npm 上的产出代码，用于对照自己产出的内容。


## 准备

需要环境: `Node >= 16.*` & `pnpm >= 8.*`


## 开始

1. 下载依赖

```shell
pnpm install
```

2. 编译

在指定的目录下执行 `compile`。以 `ant-design-mobile` 为例。

```shell

cd packages/ant-design-mobile

pnpm compile
```
