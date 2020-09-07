import * as chai from "chai";


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
  it("new Promise(fn) 中的 fn 立即执行", ()=>{
    let called = false;
    const promise = new Promise(()=>{
      called = true;
    })
    // @ts-ignore
    assert(called === true)
  })
  it("new Promise(fn)中的fn执行的时候接收 resolve 和 reject 两个函数", ()=>{
    let called = false;
    const promise = new Promise((resolve, reject)=>{
      called = true;
      assert.isFunction(resolve);
      assert.isFunction(reject);
    })
    // @ts-ignore
    assert(called)
  })

  it("promise.then(success)中的success 会在 resolve被调用的时候，执行", (done)=>{
    // done 表示等待的执行
    let called = false;
    const promise = new Promise((resolve, reject)=>{
      // 该函数没有执行
      assert(called === false); // 之前不是ture
      resolve();
      setTimeout(()=>{
        assert(called === true); //  resolve 之后是true，证明resolve()调用了succeed
        done()
      })
      console.log('代码执行了')
      // 该函数执行了
    })
    // @ts-ignore
    promise.then(()=>{
      called = true
    })
  })
})
