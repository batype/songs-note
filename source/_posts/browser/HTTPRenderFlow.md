---
title: 浏览器渲染流程
permalink: /browser/protocol/http/render.html
date: 2024年04月16日14:19:50
description: HTTP是一种允许浏览器向服务器获取资源的协议，是Web的基础，通常由浏览器发起请求，用来获取不同类型的文件，例如HTML文件、CSS文件、JavaScript文件、图片、视频等。此外，HTTP也是浏览器使用最广的协议，所以要想学好浏览器，就要先深入了解HTTP。
tag: [前端, 浏览器, http]
comments: true
categories: 
 - 浏览器
 - protocol
---

在[上一篇文章](/browser/protocol/http-navigation.html)中我们介绍了导航相关的流程，那导航被提交后又会怎么样呢？就进入了渲染阶段。这个阶段很重要，了解其相关流程能让你“看透”页面是如何工作的，有了这些知识，你可以解决一系列相关的问题，比如能熟练使用开发者工具，因为能够理解开发者工具里面大部分项目的含义，能优化页面卡顿问题，使用JavaScript优化动画流程，通过优化样式表来防止强制同步布局等等。

通常，我们编写好HTML、CSS、JavaScript等文件，经过浏览器就会显示出漂亮的页面（如下图所示），但是你知道它们是如何转化成页面的吗？这背后的原理，估计很多人都答不上来。

![渲染流程示意图](https://pic.imgdb.cn/item/661e19540ea9cb1403fbcf01.png)

从图中可以看出，左边输入的是HTML、CSS、JavaScript数据，这些数据经过中间渲染模块的处理，最终输出为屏幕上的像素。

这中间的**渲染模块**就是我们今天要讨论的主题。为了能更好地理解下文，你可以先结合下图快速抓住HTML、CSS和JavaScript的含义：

![HTML、CSS和JavaScript关系图](https://pic.imgdb.cn/item/661e19680ea9cb1403fbf33d.png)

从上图可以看出，HTML的内容是由标记和文本组成。标记也称为标签，每个标签都有它自己的语义，浏览器会根据标签的语义来正确展示HTML内容。比如上面的`<p>`标签是告诉浏览器在这里的内容需要创建一个新段落，中间的文本就是段落中需要显示的内容。

如果需要改变HTML的字体颜色、大小等信息，就需要用到CSS。CSS又称为**层叠样式表，是由选择器和属性组成**，比如图中的p选择器，它会把HTML里面`<p>`标签的内容选择出来，然后再把选择器的属性值应用到`<p>`标签内容上。选择器里面有个color属性，它的值是red，这是告诉渲染引擎把`<p>`标签的内容显示为红色。

至于**JavaScript（简称为JS），使用它可以使网页的内容“动”起来**，比如上图中，可以通过JavaScript来修改CSS样式值，从而达到修改文本颜色的目的。

搞清楚HTML、CSS和JavaScript的含义后，那么接下来我们就正式开始分析渲染模块了。

由于渲染机制过于复杂，所以渲染模块在执行过程中会被划分为很多子阶段，输入的HTML经过这些子阶段，最后输出像素。我们把这样的一个处理流程叫做渲染流水线，其大致流程如下图所示：

![渲染流水线示意图](https://pic.imgdb.cn/item/661e26820ea9cb1403168ad3.png)

按照渲染的时间顺序，流水线可以分为如下几个子阶段：构建DOM数、计算样式、布局节点、分层、绘制、分块、光栅化和合成。接下来，在介绍每一段的过程中，你应该注意关注以下三点内容：

- 开始每个子阶段都有输入内容；
- 然后每个子阶段有其他处理过程；
- 最终每个子阶段会生成输出内容。
理解了这三部分内容，能让你更加清晰地理解每个子阶段。

## 构建 DOM 树

为什么要构建DOM树呢？这是因为浏览器无法直接理解和使用HTML，所以需要将HTML转换为浏览器能够理解的结构——DOM树。

这里我们还需要简单介绍下什么是树结构，为了更直观地理解，你可以参考下面我画的几个树结构：

![树结构示意图](https://pic.imgdb.cn/item/661e269f0ea9cb140316b3e5.png)

从图中可以看出，树这种结构非常像我们现实生活中的“树”，其中每个点我们称为节点，相连的节点称为父子节点。树结构在浏览器中的应用还是比较多的，比如下面我们要介绍的渲染流程，就在频繁地使用树结构。

接下来咱们还是言归正传，来看看DOM树的构建过程，你可以参考下图：

![DOM树构建过程示意图](https://pic.imgdb.cn/item/661e275a0ea9cb140317df8e.png)

从图中可以看出，构建DOM树的输入内容是一个非常简单的HTML文件，然后经由HTML解析器解析，最终输出树状结构的DOM。

为了更加直观地理解DOM树，你可以打开Chrome的“开发者工具”，选择“Console”标签来打开控制台，然后在控制台里面输入“document”后回车，这样你就能看到一个完整的DOM树结构，如下图所示：

![DOM可视化](https://pic.imgdb.cn/item/661e278f0ea9cb14031835ea.png)

图中的document就是DOM结构，你可以看到，DOM和HTML内容几乎是一样的，但是和HTML不同的是，DOM是保存在内存中树状结构，可以通过JavaScript来查询或修改其内容。

那下面就来看看如何通过JavaScript来修改DOM的内容，在控制台中输入：

```js
document.getElementsByTagName("p")[0].innerText = "black"
```

这行代码的作用是把第一个`<p>`标签的内容修改为black，具体执行结果你可以参考下图：

![通过JavaScript修改DOM](https://pic.imgdb.cn/item/661e27e70ea9cb140318cb4e.png)

从图中可以看出，在执行了一段修改第一个`<p>`标签的JavaScript代码后，DOM的第一个p节点的内容成功被修改，同时页面中的内容也被修改了。

好了，现在我们已经生成DOM树了，但是DOM节点的样式我们依然不知道，要让DOM节点拥有正确的样式，这就需要样式计算了。

## 样式计算（Recalculate Style）

样式计算的目的是为了计算出DOM节点中每个元素的具体样式，这个阶段大体可分为三步来完成。

### 1. 把CSS转换为浏览器能够理解的结构

那CSS样式的来源主要有哪些呢？你可以先参考下图：

![HTML加载CSS的三种方式](https://pic.imgdb.cn/item/661e28840ea9cb140319c468.png)

从图中可以看出，CSS样式来源主要有三种：

- 通过link引用的外部CSS文件；
- `<style>`标记内的 CSS；
- 元素的style属性内嵌的CSS
和HTML文件一样，浏览器也是无法直接理解这些纯文本的CSS样式，所以**当渲染引擎接收到CSS文本时，会执行一个转换操作，将CSS文本转换为浏览器可以理解的结构——styleSheets**。

为了加深理解，你可以在Chrome控制台中查看其结构，只需要在控制台中输入`document.styleSheets`，然后就看到如下图所示的结构：

![styleSheets](https://pic.imgdb.cn/item/661e289f0ea9cb140319f7af.png)

从图中可以看出，这个样式表包含了很多种样式，已经把那三种来源的样式都包含进去了。当然样式表的具体结构不是我们今天讨论的重点，你只需要知道渲染引擎会把获取到的CSS文本全部转换为styleSheets结构中的数据，并且该结构同时具备了查询和修改功能，这会为后面的样式操作提供基础。

### 2. 转换样式表中的属性值，使其标准化

现在我们已经把现有的CSS文本转化为浏览器可以理解的结构了，那么**接下来就要对其进行属性值的标准化操作**。

要理解什么是属性值标准化，你可以看下面这样一段CSS文本：

```css
body {   font-size: 2em        }
p {      color: blue;          }
span  {  display: none         }
div {    font-weight: bold     }
div  p { color: green;         }
div {    color: red;           }
```

可以看到上面的CSS文本中有很多属性值，如`2em`、`blue`、`bold`，这些类型数值不容易被渲染引擎理解，所以需要将所有值转换为渲染引擎容易理解的、标准化的计算值，这个过程就是属性值标准化。

那标准化后的属性值是什么样子的？

```css
body {   font-size: 36px       }
p {      color: rgb(0, 0, 255) }
span  {  display: none         }
div {    font-weight: 700      }
div  p { color: rgb(0, 128, 0) }
div {    color: rgb(255, 0, 0) }
```

可以看到，2em被解析成了32px，red被解析成了rgb(255,0,0)，bold被解析成了700……

### 3. 计算出DOM树中每个节点的具体样式

现在样式的属性已被标准化了，接下来就需要计算DOM树中每个节点的样式属性了，如何计算呢？

这就涉及到CSS的继承规则和层叠规则了。

首先是CSS继承。CSS继承就是每个DOM节点都包含有父节点的样式。这么说可能有点抽象，我们可以结合具体例子，看下面这样一张样式表是如何应用到DOM节点上的。

```css
body {  font-size: 20px             }
p {     color: blue;                }
span  { display: none               }
div {   font-weight: bold;color:red }
div p { color: green;               }
```

这张样式表最终应用到DOM节点的效果如下图所示：

![计算后DOM的样式](https://pic.imgdb.cn/item/661e2c530ea9cb14031eba5c.png)

从图中可以看出，所有子节点都继承了父节点样式。比如body节点的font-size属性是20，那body节点下面的所有节点的font-size都等于20。

为了加深你对CSS继承的理解，你可以打开Chrome的“开发者工具”，选择第一个“element”标签，再选择“style”子标签，你会看到如下界面：

![样式的继承过程界面](https://pic.imgdb.cn/item/661e2c820ea9cb14031edcbd.png)

这个界面展示的信息很丰富，大致可描述为如下。

- 首先，可以选择要查看的**元素的样式（位于图中的区域2中）**，在图中的第1个区域中点击对应的元素，就可以在下面的区域查看该元素的样式了。比如这里我们选择的元素是`<p>`标签，位于`html.body.div.`这个路径下面。
- 其次，可以从**样式来源（位于图中的区域3中）**中查看样式的具体来源信息，看看是来源于样式文件，还是来源于UserAgent样式表。**这里需要特别提下UserAgent样式，它是浏览器提供的一组默认样式，如果你不提供任何样式，默认使用的就是UserAgent样式**。
- 最后，可以通过区域2和区域3来查看样式继承的具体过程。
以上就是CSS继承的一些特性，样式计算过程中，会根据DOM节点的继承关系来合理计算节点样式。

样式计算过程中的第二个规则是样式层叠。**层叠是CSS的一个基本特征，它是一个定义了如何合并来自多个源的属性值的算法。它在CSS处于核心地位，CSS的全称“层叠样式表”正是强调了这一点**。关于层叠的具体规则这里就不做过多介绍了，网上资料也非常多，你可以自行搜索学习。

总之，样式计算阶段的目的是为了计算出DOM节点中每个元素的具体样式，在计算过程中需要遵守CSS的继承和层叠两个规则。这个阶段最终输出的内容是每个DOM节点的样式，并被保存在ComputedStyle的结构内。

如果你想了解每个DOM元素最终的计算样式，可以打开Chrome的“开发者工具”，选择第一个“element”标签，然后再选择“Computed”子标签，如下图所示：

![DOM元素最终计算的样式](https://pic.imgdb.cn/item/661e2cb90ea9cb14031f29e4.png)

上图红色方框中显示了`html.body.div.p`标签的ComputedStyle的值。你想要查看哪个元素，点击左边对应的标签就可以了。

## 布局阶段

现在，我们有DOM树和DOM树中元素的样式，但这还不足以显示页面，因为我们还不知道DOM元素的几何位置信息。**那么接下来就需要计算出DOM树中可见元素的几何位置，我们把这个计算过程叫做布局**。

Chrome在布局阶段需要完成两个任务：创建布局树和布局计算。

### 1. 创建布局树

你可能注意到了DOM树还含有很多不可见的元素，比如head标签，还有使用了`display:none`属性的元素。所以在**显示之前，我们还要额外地构建一棵只包含可见元素布局树**。

我们结合下图来看看布局树的构造过程：

![布局树构造过程示意图](https://pic.imgdb.cn/item/661e2f090ea9cb1403231904.png)

从上图可以看出，DOM树中所有不可见的节点都没有包含到布局树中。

为了构建布局树，浏览器大体上完成了下面这些工作：

- 遍历DOM树中的所有可见节点，并把这些节点加到布局树中；
- 而不可见的节点会被布局树忽略掉，如head标签下面的全部内容，再比如 `body.p.span` 这个元素，因为它的属性包含 `dispaly:none`，所以这个元素也没有被包进布局树。

### 2. 布局计算

现在我们有了一棵完整的布局树。那么接下来，就要计算布局树节点的坐标位置了。布局的计算过程非常复杂，我们这里先跳过不讲，等到后面章节中我再做详细的介绍。

在执行布局操作的时候，会把布局运算的结果重新写回布局树中，所以布局树既是输入内容也是输出内容，这是布局阶段一个不合理的地方，因为在布局阶段并没有清晰地将输入内容和输出内容区分开来。针对这个问题，Chrome团队正在重构布局代码，下一代布局系统叫LayoutNG，试图更清晰地分离输入和输出，从而让新设计的布局算法更加简单。

## 分层

现在我们有了布局树，而且每个元素的具体位置信息都计算出来了，那么接下来是不是就要开始着手绘制页面了？

答案依然是否定的。

因为页面中有很多复杂的效果，如一些复杂的3D变换、页面滚动，或者使用z-indexing做z轴排序等，为了更加方便地实现这些效果，**渲染引擎还需要为特定的节点生成专用的图层，并生成一棵对应的图层树**（LayerTree）。如果你熟悉PS，相信你会很容易理解图层的概念，正是这些图层叠加在一起构成了最终的页面图像。

要想直观地理解什么是图层，你可以打开Chrome的“开发者工具”，选择“Layers”标签，就可以可视化页面的分层情况，如下图所示：

![渲染引擎给页面多图层示意图](https://pic.imgdb.cn/item/661e3b160ea9cb1403381d0c.png)

从上图可以看出，渲染引擎给页面分了很多图层，这些图层按照一定顺序叠加在一起，就形成了最终的页面，你可以参考下图：

![图层叠加的最终展示页面](https://pic.imgdb.cn/item/661e3b7a0ea9cb140338effe.png)

现在你知道了**浏览器的页面实际上被分成了很多图层，这些图层叠加后合成了最终的页面**。下面我们再来看看这些图层和布局树节点之间的关系，如文中图所示：

![布局树和图层树关系示意图](https://pic.imgdb.cn/item/661e3bdf0ea9cb140339b58c.png)

通常情况下，**并不是布局树的每个节点都包含一个图层，如果一个节点没有对应的层，那么这个节点就从属于父节点的图层**。如上图中的span标签没有专属图层，那么它们就从属于它们的父节点图层。但不管怎样，最终每一个节点都会直接或者间接地从属于一个层。

那么需要满足什么条件，渲染引擎才会为特定的节点创建新的图层呢？通常满足下面两点中任意一点的元素就可以被提升为单独的一个图层。

**第一点，拥有层叠上下文属性的元素会被提升为单独的一层**。

页面是个二维平面，但是层叠上下文能够让HTML元素具有三维概念，这些HTML元素按照自身属性的优先级分布在垂直于这个二维平面的z轴上。你可以结合下图来直观感受下：

![层叠上下文示意图](https://pic.imgdb.cn/item/661e3c340ea9cb14033a6f64.png)

从图中可以看出，明确定位属性的元素、定义透明属性的元素、使用CSS滤镜的元素等，都拥有层叠上下文属性。

**第二点，需要剪裁（clip）的地方也会被创建为图层**。

不过首先你需要了解什么是剪裁，结合下面的HTML代码：

```HTML
<style>
      div {
            width: 200;
            height: 200;
            overflow:auto;
            background: gray;
        } 
</style>
<body>
    <div >
        <p>所以元素有了层叠上下文的属性或者需要被剪裁，那么就会被提升成为单独一层，你可以参看下图：</p>
        <p>从上图我们可以看到，document层上有A和B层，而B层之上又有两个图层。这些图层组织在一起也是一颗树状结构。</p>
        <p>图层树是基于布局树来创建的，为了找出哪些元素需要在哪些层中，渲染引擎会遍历布局树来创建层树（Update LayerTree）。</p> 
    </div>
</body>

```

在这里我们把div的大小限定为`200 * 200`像素，而div里面的文字内容比较多，文字所显示的区域肯定会超出`200 * 200`的面积，这时候就产生了剪裁，渲染引擎会把裁剪文字内容的一部分用于显示在div区域，下图是运行时的执行结果：

![剪裁执行结果](https://pic.imgdb.cn/item/661e3e1d0ea9cb14033e8787.png)

出现这种裁剪情况的时候，渲染引擎会为文字部分单独创建一个层，如果出现滚动条，滚动条也会被提升为单独的层。你可以参考下图：

![被裁剪的内容会出现在单独一层](https://pic.imgdb.cn/item/661e3e350ea9cb14033eb626.png)

所以说，元素有了层叠上下文的属性或者需要被剪裁，满足其中任意一点，就会被提升成为单独一层。

## 图层绘制

在完成图层树的构建之后，渲染引擎会对图层树中的每个图层进行绘制，那么接下来我们看看渲染引擎是怎么实现图层绘制的？

试想一下，如果给你一张纸，让你先把纸的背景涂成蓝色，然后在中间位置画一个红色的圆，最后再在圆上画个绿色三角形。你会怎么操作呢？

通常，你会把你的绘制操作分解为三步：

1. 绘制蓝色背景；
2. 在中间绘制一个红色的圆；
3. 再在圆上绘制绿色三角形。
渲染引擎实现图层的绘制与之类似，会把一个图层的绘制拆分成很多小的绘制指令，然后再把这些指令按照顺序组成一个待绘制列表，如下图所示：

![绘制列表](https://pic.imgdb.cn/item/661e3ebc0ea9cb14033fe7b4.png)

从图中可以看出，绘制列表中的指令其实非常简单，就是让其执行一个简单的绘制操作，比如绘制粉色矩形或者黑色的线等。而绘制一个元素通常需要好几条绘制指令，因为每个元素的背景、前景、边框都需要单独的指令去绘制。所以在图层绘制阶段，输出的内容就是这些待绘制列表。

你也可以打开“开发者工具”的“Layers”标签，选择“document”层，来实际体验下绘制列表，如下图所示：

![一个图层的绘制列表](https://pic.imgdb.cn/item/661e3f250ea9cb14034112d7.png)

在该图中，区域1就是document的绘制列表，拖动区域2中的进度条可以重现列表的绘制过程。

## 栅格化（raster）操作

绘制列表只是用来记录绘制顺序和绘制指令的列表，而实际上绘制操作是由渲染引擎中的合成线程来完成的。你可以结合下图来看下渲染主线程和合成线程之间的关系：

![渲染进程中的合成线程和主线程](https://pic.imgdb.cn/item/661e3fbc0ea9cb140342453f.png)

如上图所示，当图层的绘制列表准备好之后，主线程会把该绘制列表提交（commit）给合成线程，那么接下来合成线程是怎么工作的呢？

那我们得先来看看什么是视口，你可以参看下图：

![视口](https://pic.imgdb.cn/item/661e403d0ea9cb1403435f72.png)

通常一个页面可能很大，但是用户只能看到其中的一部分，我们把用户可以看到的这个部分叫做**视口**（viewport）。

在有些情况下，有的图层可以很大，比如有的页面你使用滚动条要滚动好久才能滚动到底部，但是通过视口，用户只能看到页面的很小一部分，所以在这种情况下，要绘制出所有图层内容的话，就会产生太大的开销，而且也没有必要。

基于这个原因，**合成线程会将图层划分为图块**（tile），这些图块的大小通常是256x256或者512x512，如下图所示：

![图层被划分为图块示意图](https://pic.imgdb.cn/item/661e40a20ea9cb1403440a1c.png)

然后**合成线程会按照视口附近的图块来优先生成位图，实际生成位图的操作是由栅格化来执行的。所谓栅格化，是指将图块转换为位图**。而图块是栅格化执行的最小单位。渲染进程维护了一个栅格化的线程池，所有的图块栅格化都是在线程池内执行的，运行方式如下图所示：

![合成线程提交图块给栅格化线程池](https://pic.imgdb.cn/item/661e40fb0ea9cb140344bde8.png)

通常，栅格化过程都会使用GPU来加速生成，使用GPU生成位图的过程叫快速栅格化，或者GPU栅格化，生成的位图被保存在GPU内存中。

相信你还记得，GPU操作是运行在GPU进程中，如果栅格化操作使用了GPU，那么最终生成位图的操作是在GPU中完成的，这就涉及到了跨进程操作。具体形式你可以参考下图：

![GPU栅格化](https://pic.imgdb.cn/item/661e412d0ea9cb140345186c.png)

从图中可以看出，渲染进程把生成图块的指令发送给GPU，然后在GPU中执行生成图块的位图，并保存在GPU的内存中。

## 合成和显示

一旦所有图块都被光栅化，合成线程就会生成一个绘制图块的命令——“DrawQuad”，然后将该命令提交给浏览器进程。

浏览器进程里面有一个叫viz的组件，用来接收合成线程发过来的DrawQuad命令，然后根据DrawQuad命令，将其页面内容绘制到内存中，最后再将内存显示在屏幕上。

到这里，经过这一系列的阶段，编写好的HTML、CSS、JavaScript等文件，经过浏览器就会显示出漂亮的页面了。

## 渲染流水线大总结

好了，我们现在已经分析完了整个渲染流程，从HTML到DOM、样式计算、布局、图层、绘制、光栅化、合成和显示。下面我用一张图来总结下这整个渲染流程：

![完整的渲染流水线示意图](https://pic.imgdb.cn/item/661e41d80ea9cb1403463b38.png)

结合上图，我们可以大致总结为：

- 渲染进程将HTML内容转化为浏览器可以识别的DOM树结构；
- 渲染引擎将CSS样式表转化为浏览器可以理解的styleSheets，计算出DOM节点的样式；
- 创建布局树，并计算元素的布局信息；
- 对布局树进行分层，并生成分层树；
- 为每个图床生成**绘制列表**，并将其提交到合成线程；
- 合成线程将图层分成**图块**，并在**光栅化线程池**中将图块转化成位图；
- 合成线程发送绘制图块命令`DrawQuad`给浏览器进程；
- 浏览器根据`DrawQuad`消息生成页面，并显示到显示器上。

## 相关概念

有了上面介绍渲染流水线的基础，我们再来看看三个和渲染流水线相关的概念——**“重排”“重绘”和“合成”**。理解了这三个概念对于你后续Web的性能优化会有很大帮助。

### 1. 更新了元素的几何属性（重排）

你可先参考下图：

![更新元素的几何属性](https://pic.imgdb.cn/item/661e4a980ea9cb140354fc18.png)

从上图可以看出，如果你通过JavaScript或者CSS修改元素的几何位置属性，例如改变元素的宽度、高度等，那么浏览器会触发重新布局，解析之后的一系列子阶段，这个过程就叫**重排**。无疑，**重排需要更新完整的渲染流水线，所以开销也是最大的**。

### 2. 更新元素的绘制属性（重绘）

接下来，我们再来看看重绘，比如通过JavaScript更改某些元素的背景颜色，渲染流水线会怎样调整呢？你可以参考下图：

![更新元素背景](https://pic.imgdb.cn/item/661e4af50ea9cb140355ae73.png)

从图中可以看出，如果修改了元素的背景颜色，那么布局阶段将不会被执行，因为并没有引起几何位置的变换，所以就直接进入了绘制阶段，然后执行之后的一系列子阶段，这个过程就叫**重绘**。相较于重排操作，**重绘省去了布局和分层阶段，所以执行效率会比重排操作要高一些**。

### 3. 直接合成阶段

那如果你更改一个既不要布局也不要绘制的属性，会发生什么变化呢？渲染引擎将跳过布局和绘制，只执行后续的合成操作，我们把这个过程叫做**合成**。具体流程参考下图：

![避开重排和重绘](https://pic.imgdb.cn/item/661e4b6d0ea9cb14035676b3.png)

在上图中，我们使用了CSS的transform来实现动画效果，这可以避开重排和重绘阶段，直接在非主线程上执行合成动画操作。这样的效率是最高的，因为是在非主线程上合成，并没有占用主线程的资源，另外也避开了布局和绘制两个子阶段，所以相对于重绘和重排，合成能大大提升绘制效率。

## 总结

通过本文的分析，你应该可以看到，Chrome的渲染流水线还是相当复杂晦涩，且难以理解，不过Chrome团队在不断添加新功能的同时，也在不断地重构一些子阶段，目的就是让整体渲染架构变得更加简单和高效，正所谓大道至简。

通过这么多年的生活和工作经验来看，无论是做架构设计、产品设计，还是具体到代码的实现，甚至处理生活中的一些事情，能够把复杂问题简单化的人都是具有大智慧的。所以，在工作或生活中，你若想要简化遇到的问题，就要刻意地练习，练就抓住问题本质的能力，把那些复杂的问题简单化，从而最终真正解决问题。
