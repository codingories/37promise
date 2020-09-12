class Promise2{
  state = 'pending';
  callbacks = [];
  private resolveOrReject(state, data, i){
    if (this.state !== "pending") {return;}
    this.state = state;
    nextTick(()=>{
      // 遍历 callbacks,调用所有的handle[0]
      this.callbacks.forEach((handle)=>{
        if(typeof handle[i] === 'function'){
          let x;
          try {
            x = handle[i].call(undefined, data)
          } catch(e) {
            return handle[2].reject(e)
          }
          handle[2].resolveWith(x)
        }
      })
    })
  }
  resolve = (result)=>{
    this.resolveOrReject('fulfilled', result, 0)
  };
  reject = (reason)=>{
    this.resolveOrReject('rejected', reason, 1)
  };
  constructor(fn){
    if(typeof fn !== 'function'){
      throw new Error("我只接收函数")
    }
    fn(this.resolve.bind(this), this.reject.bind(this));
  }
  then(succeed?, fail?){
    const handle = [succeed,fail];
    if(typeof succeed === 'function'){
      handle[0] = succeed;
    }
    if(typeof fail === 'function'){
      handle[1] = fail;
    }
    handle[2] = new Promise2(()=>{});
    this.callbacks.push(handle);
    // 把函数推到callbacks
    return handle[2]
  }
  resolveWithSelf(){
    this.reject(new TypeError)
  }
  resolveWithPromise(x){
    x.then(
      result=>{
        this.resolve(result)
      },
      reason=>{
        this.reject(reason)
      }
    )
  }
  resolveWithObject(x){
    let then; // 这段代码段的意思就是看下x.then是不是一个方法，是就调用
    try {
      then = x.then
    } catch(e){
      this.reject(e)
    }
    if(then instanceof Function){
      try {
        x.then(y=>{
            this.resolveWith(y)
          },
          r=>{
            this.reject(r)
          }
        )
      } catch (e) {
        this.reject(e)
      }
    } else {
      this.resolve(x)
    }
  }
  resolveWith(x){
    if(this === x){
      this.resolveWithSelf();
    } else if(x instanceof Promise2){
      this.resolveWithPromise(x)
    } else if(x instanceof Object){
      this.resolveWithObject(x)
    } else {
      this.resolve(x)
    }
  }
}

export default Promise2;

function nextTick(fn) {
  if(process!==undefined && typeof process.nextTick === 'function'){
    return process.nextTick(fn)
  } else {
    var counter = 1;
    var observer = new MutationObserver(fn);
    var textNode = document.createTextNode(String(counter));
    // 先让文本内容为counter，然后让文本内容为counter, 文本节点变了，
    // 变了后fn不会马上调用,会尽快调用,变化的时间比nextTick快
    observer.observe(textNode, {
      characterData: true
    });
    counter = counter + 1;
    textNode.data = String(counter)
  }
}
