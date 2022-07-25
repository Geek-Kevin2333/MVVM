/*观察者的目的就是给需要变化的元素增加一个观察者，当数据变化后有对应的
* 方法.用新值和老值作比较，如果发送变化，就调用更新方法*/
class Watcher{
    constructor(vm,expr,cb) {
        this.vm=vm
        this.expr=expr
        this.cb=cb
    //    先获取老值
        this.value=this.get()
    }
    getVal(vm,expr){
        expr = expr.split('.') //处理 message.a.b.c这样的expr
        return expr.reduce((prev,next)=>{
            return prev[next]  //第一次就是 vm.$data.a
        },vm.$data)
    }
    get(){
        Dep.target = this
        let value=this.getVal(this.vm,this.expr)
        Dep.target = null
        return value
    }
    //对外暴露的方法
    update(){
        let newValue = this.getVal(this.vm, this.expr)
        let oldValue = this.value
        if (newValue !== oldValue) {
            this.cb(newValue)//调用watch的callback
        }
    }
}
