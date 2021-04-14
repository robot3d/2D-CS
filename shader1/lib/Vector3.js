////////////////////////////////////////////////////////////////////////////////////////////
//  Copyright (C) 2015 ZeroWorks.Co.Ltd. All rights reserved.
//  Author:D.J http://blog.csdn.net/crystal_do
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
////////////////////////////////////////////////////////////////////////////////////////////

//vec:[x, y, z]
function Vector3(vec) {
    this.array = new Float32Array(3);
    this.array[0] = vec[0];
    this.array[1] = vec[1];
    this.array[2] = vec[2];

    Vector3.prototype.normalized = function() {
        var x = this.array[0];
        var y = this.array[1];
        var z = this.array[2];
        var sq = Math.sqrt(x * x + y * y + z * z);

        var epsilon = 0.0000001;
        if (sq > epsilon) {
            var inv = 1.0 / sq;
            x = x * inv;
            y = y * inv;
            z = z * inv;
        }

        return new Vector3([x, y, z]);
    };

    Vector3.prototype.normalize = function() {
        var n = this.normalized();
        this.array = n.array;
    };

    //right:Vector3
    Vector3.prototype.multiply = function(right) {
        var vecl = this.array;
        var vecr = right.array;

        var x = vecl[1] * vecr[2] - vecl[2] * vecr[1];
        var y = vecl[2] * vecr[0] - vecl[0] * vecr[2];
        var z = vecl[0] * vecr[1] - vecl[1] * vecr[0];

        return new Vector3([x, y, z]);
    };

    //right:Vector3
    Vector3.prototype.dot = function(right) {
        var vecl = this.array;
        var vecr = right.array;

        return vecl[0] * vecr[0] + vecl[1] * vecr[1] + vecl[2] * vecr[2];
    };
}