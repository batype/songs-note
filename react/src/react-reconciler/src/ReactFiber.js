// 3. 工作标签
import { HostRoot, IndeterminateComponent } from "./ReactWorkTags";
// 5. 副作用标识
import { NoFlags } from "./ReactFiberFlags";

export function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.key = key;
  this.type = null; // fiber类型, 来自于虚拟DOM节点的type   (span h1 p)
  this.stateNode = null; // 此fiber对应的真实DOM节点

  this.return = null; // 指向父节点
  this.child = null; // 指向第一个子节点
  this.sibling = null; // 指向弟弟

  this.pendingProps = pendingProps; // 等待生效的属性
  this.memoizedProps = null; // 已经生效的属性
  // 虚拟DOM会提供pendingProps给创建fiber的属性，等处理完复制给memoizedProps

  // 每个fiber还会有自己的状态，每一种fiber状态存的类型都不一样
  // 比如：类组件对应的fiber存的就是实例的状态，HostRoot存的就是要渲染的元素
  this.memoizedState = null;

  // 每个fiber可能还有自己的更新队列
  this.updateQueue = null;

  // 5. "./ReactFiberFlags"
  this.flags = NoFlags; // 副作用标识，表示对此fiber节点进行何种操作
  this.subtreeFlags = NoFlags; // 子节点对应的副作用标识
  this.alternate = null; // 轮替 (缓存了另一个fiber节点实例) diff时用
}

export function createFiberNode(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}

export function createHostRootFiber() {
  return createFiberNode(HostRoot, null, null);
}

/**
 * 根据老fiber和新的属性构建新fiber
 * @param {*} current 老fiber
 * @param {*} pendingProps 新的属性
 */
export function creatWorkInProgress(current, pendingProps) {
  // 3. 拿到老fiber的轮替 第一次没有 (初始化)
  let workInProgress = current.alternate;
  if(workInProgress === null) {
    workInProgress = createFiberNode(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;

    workInProgress.stateNode = current;
    current.alternate =  workInProgress;
  } else {
    // 如果有，说明是更新，只能改属性就可以复用
    workInProgress.pendingProps = current.pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = current.flags;
    workInProgress.subtreeFlags = NoFlags;
  }
  // 复制属性
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
}

export function createFiberFromElement(element) {
  const type = element.type;
  const key = element.key;
  const pendingProps = element.props;
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps
  );
  return fiber;
}

export function createFiberFromTypeAndProps(type, key, pendingProps) {
  let fiberTag = IndeterminateComponent;
  const fiber = createFiberNode(fiberTag, pendingProps, key);
  fiber.type = type;
  return fiber;
}