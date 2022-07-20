import Watcher from '../watcher'
import {Observer} from "../observer";
import {Compile} from "../compile";
import {MVVM} from "../MVVM";
import 'whatwg-fetch'
import $ from "jquery"
import {re} from "@babel/core/lib/vendor/import-meta-resolve";

const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.resolve('D:\\CODE\\MVVM', './MVVM.html'), 'utf8');
jest.dontMock('fs');

let options={}

describe('$', function () {
    beforeEach(() => {
        document.documentElement.innerHTML = html.toString();
        options={
            el:"#app",
            data:{
                message:{
                    a:'hello'
                }
            }
        }

    });
    afterEach(jest.resetModules);
    test('observer,测试数据劫持' , function (done) {
        let observer=new Observer(options.data)
        expect(options.data.message).hasOwnProperty('get')
        expect(options.data.message).hasOwnProperty('set')
        done()
    })
    test('observer，测试发布订阅模式',function (done) {

    })


});