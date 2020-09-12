import * as chai from "chai";
import * as sinon from 'sinon'
import * as sinonChai from 'sinon-chai'
chai.use(sinonChai)

const assert = chai.assert;
import Promise from "../src/promise"

describe("Promise", ()=>{
  it("是一个类",()=>{
    // assert(typeof Promise === 'function'); // 检测是不是函数
    // assert(typeof Promise.prototype === "object"); // 检测是不是对象
    assert.isFunction(Promise) // chai.assert 可以对以上两句的简写
    assert.isObject(Promise.prototype)
  })
  it("new Promise() 必须接收一个函数,不是一个函数就报错", () => {
    assert.throw(() => { // assert.throw预测某个东西会报错，接收一个函数
      // @ts-ignore
      new Promise(1); // 函数体里就是要报错的东西,这里的意思是预测new Promise会报错
    });
    assert.throw(() => { // assert.throw预测某个东西会报错，接收一个函数
      // @ts-ignore
      new Promise(false); // 函数体里就是要报错的东西,这里的意思是预测new Promise会报错
    });
  });
  it("new Promise(fn)会生成一个对象，对象有then方法", ()=>{
    const promise = new Promise(()=>{});
    assert.isFunction(promise.then);
  });
  it("new Promise(fn) 中的 fn 立即执行", ()=> {
    let fn = sinon.fake()
    new Promise(fn)
    assert(fn.called)
  })
  it("new Promise(fn)中的fn执行的时候接收 resolve 和 reject 两个函数", (done)=>{
    new Promise((resolve, reject)=>{
      assert.isFunction(resolve);
      assert.isFunction(reject);
      done()
    })
  })
  it("promise.then(success)中的success 会在 resolve被调用的时候，执行", (done)=>{
    // done 表示等待的执行
    const success= sinon.fake()
    const promise = new Promise((resolve, reject)=>{
      // 该函数没有执行
      // assert(called === false); // 之前不是ture
      assert.isFalse(success.called)
      resolve();
      setTimeout(()=>{
        assert.isTrue(success.called)
        done()
      })
      // 该函数执行了
    })
    // @ts-ignore
    promise.then(success)
  })
  it("promise.then(null, fail)中的fail 会在 reject被调用的时候，执行", (done)=>{
    // done 表示等待的执行
    const fail= sinon.fake()
    const promise = new Promise((resolve, reject)=>{
      // 该函数没有执行
      // assert(called === false); // 之前不是ture
      assert.isFalse(fail.called)
      reject();
      setTimeout(()=>{
        assert.isTrue(fail.called)
        done()
      })
      // 该函数执行了
    })
    // @ts-ignore
    promise.then(null,fail)
  })
  it('2.2.1-onFulfilled 和 onRejected 都是可选的,不是函数则忽略',()=>{
    const promise = new Promise((resolve)=>{
      resolve()
    })
    promise.then(false, null);
    assert(1===1)
  })
  it('2.2.2',(done)=>{
    const succeed = sinon.fake()
    const promise = new Promise((resolve)=>{
      assert.isFalse(succeed.called)
      resolve(233)
      resolve(2333)
      setTimeout(()=>{
        assert(promise.state === 'fulfilled')
        assert.isTrue(succeed.calledOnce)
        assert(succeed.calledWith(233));
        done()
      },0)
    })
    promise.then(succeed);
  })
  it('2.2.3',(done)=>{
    const fail = sinon.fake()
    const promise = new Promise((resolve,reject)=>{
      assert.isFalse(fail.called)
      reject(233)
      reject(2333)
      setTimeout(()=>{
        assert(promise.state === 'rejected')
        assert.isTrue(fail.calledOnce)
        assert(fail.calledWith(233));
        done()
      },0)
    })
    promise.then(null,fail);
  })
  it('2.2.4 在我的代码块执行完毕之前，不得调用 then 后面的两函数', (done)=>{
    const succeed = sinon.fake()
    const promise = new Promise((resolve)=>{
      resolve()
    })
    promise.then(succeed);
    assert.isFalse(succeed.called) // 这句话还没有执行完，不得调用succeed
    setTimeout(()=>{
      assert.isTrue(succeed.called)
      done();
    },0)
  })
  it('2.2.4 失败回调', (done)=>{
    const fn = sinon.fake()
    const promise = new Promise((resolve, reject)=>{
      reject()
    })
    promise.then(null, fn);
    assert.isFalse(fn.called) // 这句话还没有执行完，不得调用succeed
    setTimeout(()=>{
      assert.isTrue(fn.called)
      done();
    },0)
  })
  it('2.2.5', (done)=>{
    const promise = new Promise((resolve)=>{
      resolve()
    })
    promise.then(function(){
      'use strict'; // 避免没有指定this，this是window的问题
      assert(this === undefined);
      done();
    });
  })
  it('2.2.6 then可以在同一个promise里被多次调用',done => {
    const promise = new Promise((resolve)=>{
      resolve()
    })
    const callbacks = [sinon.fake(),sinon.fake(),sinon.fake()]
    promise.then(callbacks[0])
    promise.then(callbacks[1])
    promise.then(callbacks[2])
    setTimeout(()=>{
      assert(callbacks[0].called);
      assert(callbacks[1].called);
      assert(callbacks[2].called);
      assert(callbacks[1].calledAfter(callbacks[0]));
      assert(callbacks[2].calledAfter(callbacks[1]));
      done();
    })
  })
  it('2.2.6.2 then可以在同一个promise里被多次调用',done => {
    const promise = new Promise((resolve, reject)=>{
      reject()
    })
    const callbacks = [sinon.fake(),sinon.fake(),sinon.fake()]
    promise.then(null, callbacks[0])
    promise.then(null, callbacks[1])
    promise.then(null, callbacks[2])
    setTimeout(()=>{
      assert(callbacks[0].called);
      assert(callbacks[1].called);
      assert(callbacks[2].called);
      assert(callbacks[1].calledAfter(callbacks[0]));
      assert(callbacks[2].calledAfter(callbacks[1]));
      done();
    })
  })
  it("2.2.7 then必须返回一个promise", ()=>{
    const promise = new Promise(resolve => {
      resolve()
    })
    const promise2 = promise.then(()=>{},()=>{})
    // @ts-ignore
    assert(promise2 instanceof Promise);
  })
  it("2.2.7.1 如果then(success, fail)中的 success 返回一个值x, " +
    "运行 [[Resolve]](promise2, x)",(done)=>{
    const promise1 = new Promise(resolve => {
      resolve()
    })
    const promise2 = promise1.then(()=>'成功',()=>{}).then(result => {
      assert.equal(result, '成功')
      done()
    });
  }),
  it("2.2.7.2 如果x是一个Promise实例 " +
    "运行 [[Resolve]](promise2, x)",(done)=>{
    const promise1 = new Promise(resolve => {
      resolve()
    })
    const fn =sinon.fake()
    const promise2 =  promise1.then(
      /* s1 */
      ()=>new Promise(resolve=>{resolve()})
    )
    promise2.then(fn)
    setTimeout(()=>{
      assert(fn.called);
      done()
    },20)
  })
})

// assert(promise2 instanceof Promise)
// @ts-ignore
// promise2.then((result)=>{
//   // promise2会等success调用, success调用后会把成功传给promise2
//
// })
// assert(promise2 instanceof Promise);
