var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// async function timeout(flag) {
//     if(flag) {
//         return 'hello world';
//     } else {
//         throw 'my god, failure';
//     }
// }
// timeout(false).catch(err => {
//     console.log(err);
// })
function doubleAfter2seconds(num) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(2 * num);
        }, 2000);
    });
}
function testResult() {
    return __awaiter(this, void 0, void 0, function* () {
        let first = yield doubleAfter2seconds(30);
        let second = yield doubleAfter2seconds(50);
        let third = yield doubleAfter2seconds(30);
        console.log(`${first}+${second}+${third}`);
    });
}
testResult();
//# sourceMappingURL=testasync.js.map