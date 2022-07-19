class MVVM{ //桥梁作用--将compile和数据劫持连接在一起
    constructor(options) {
    //    先把可用的数据挂载在实例（this上面）便于复用
        this.$el=options.el
        this.$data=options.data

    //    如果有要编译的模板，就要开始编译
        if(this.$el){
        //    用数据和元素进行编译
            new Compile(this.$el,this)
        }
    }
}