class Observer{
    constructor(data) {
        this.observe(data)
    }
    observe(data){
    //    对data数据，原有的属性均改成get和set的形式
        if (!data || typeof data !== 'object') {
            return
        }
    //    对数据一一劫持 先获取到data的key和value
        Object.keys(data).forEach(key=>{
        //    劫持
            this.defineReactive(data,key,data[key])
            // 递归劫持
            this.observe(data[key])
        })

    }
//    定义响应式
    defineReactive(obj,key,value){
        let that=this
        let dep = new Dep()//每个变化的数据都会对应一个数组中的一个数据，这个数组存放所有更新的操作
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){//获取值时候的调用的方法
                Dep.target && dep.addSub(Dep.target)
                return value
            },
            set(newValue) {//给data属性中设置值的时候，更改获取到属性的值
                if (newValue !== value) {
                    that.observe(newValue)
                    value = newValue
                    dep.notify()//通知所有人，数据已经更新了
                }
            }
        })

    }
}
//发布订阅的实现
class Dep{
    constructor() {
        //订阅的数组
        this.subs=[]
    }
    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update()
        })
    }
}

module.exports={Observer}