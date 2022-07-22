export default class Compile{
    constructor(el,vm) {
        //el可能就是dom节点，也有可能需要自己获取
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm=vm
        if(this.el){
        //    如果el节点能够获取到，我们才能开始编译
        //    步骤:1.先将真实DOM移入内存（fragment）中，比频繁操作DOM快
            let fragment=this.node2fragment(this.el)
        //    2.编译-》提取想要的元素节点 v-model 和 文本节点{{}}  提取之后需要替换
            this.compile(fragment)
        //    3.把编译好的fragment放回页面中
            this.el.appendChild(fragment)
        }
    }
//    辅助方法
//    判断这里的节点是dom节点还是字符
    isElementNode(node){
        return node.nodeType === 1;
    }
    isDirective(name){
        return name.includes('v-')
    }

//    核心方法
    node2fragment(el){//将el节点中的内容全部放在内存中去
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment //将节点放在内存中了，如果不放回页面的话，页面会为空
    }

    compile(fragment){
    //    需要递归才能拿到父节点以及所有的子节点
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node=>{
            if(this.isElementNode(node)){
            //    dom节点--可能是父节点，内存仍然有子节点，此时还需要深入递归
            //    编译元素
            this.compileElement(node);

            //  箭头函数没有this对象，所以这里的this始终指向Compile的实例

                this.compile(node)

            }
            else {
            //    文本
            //    编译文本
            this.compileText(node)
            }
            }
        )
    }

    compileElement(node){
    //    取节点中的属性，得到v-model
        let attrs=node.attributes
        Array.from(attrs).forEach(attr=>{
        //    判断属性名称是否包含v-
            if(this.isDirective(attr.name)){
            //    取到vm中data对应的值，放在该节点（node）中 做替换
                let expr = attr.value;
            //    v-model v-text v-html 有多个v-指令type
                let [,type] = attr.name.split('-')
                this.CompileUtil[type](node, this.vm, expr);
            }

        })
    }

    compileText(node) {
        let expr = node.textContent
        //取{{}}中字符的内容
        let reg = /\{\{([^}]+)\}\}/g
        if(reg.test(expr)){
           this.CompileUtil['text'](node, this.vm, expr);
        }
    }

    CompileUtil={
        getVal(vm,expr){
            expr = expr.split('.') //处理 message.a.b.c这样的expr
            return expr.reduce((prev,next)=>{
                return prev[next]  //第一次就是 vm.$data.a
            },vm.$data)
        },
        getTextVal(vm,expr){ //获取编译文本之后的结果
            return  expr.replace(/\{\{([^}]+)\}\}/g,(...argument)=>{
                return this.getVal(vm,argument[1])
            })
        },
        text(node, vm, expr) {//文本处理
            let updateFn = this.updater['textUpdater'];
            let value=this.getTextVal(vm,expr)
            //R expr的形式可能是{{a}}{{b}}
            expr.replace(/\{\{([^}]+)\}\}/g,(...argument)=>{
                new Watcher(vm,argument[1],()=>{
                    //如果数据变化了，文本节点需要重新获取依赖的属性，更新文本中的内容
                    updateFn && updateFn(node,this.getTextVal(vm,expr))
                })
            })
            updateFn && updateFn(node,value)
        },
        setVal(vm, expr, newVal) {
            expr = expr.split('.')
            return expr.reduce((prev,next,currentIndex)=>{
                if (currentIndex === expr.length - 1) {
                    return prev[next] = newVal
                }
                return prev[next]
            },vm.$data)
        },
        model(node,vm,expr){//输入框处理
            let updateFn = this.updater['modelUpdater'];
            //这里有一个监控 当数据变化了 有关调用这个watch的callback函数
            new Watcher(vm,expr,(newValue)=>{
                //值变化后会调用cb，将新值传递过来
                updateFn && updateFn(node,this.getVal(vm,expr))
            })
            node.addEventListener('input', (e) => {
                let newValue = e.target.value
                this.setVal(vm,expr,newValue)
            });
            updateFn && updateFn(node,this.getVal(vm,expr))
        }
        ,
        updater: {
            //文本更新
            textUpdater(node,value) {
                node.textContent = value;
            },
            //输入框更新
            modelUpdater(node,value){
                node.value = value;
            }
        }
    }

}

