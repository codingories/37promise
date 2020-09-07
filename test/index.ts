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
  })
})
