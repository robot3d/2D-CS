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

function Quaternion() {
    this.array = new Float32Array(4);

    Quaternion.prototype.set = function(vec) {
        var array = this.array;
        array.set(vec, 0);

        return this;
    }
    
    Quaternion.prototype.multiply = function(right) {
        var q = new Quaternion();
        var array = q.array;

        var quatl = this.array;
        var quatr = right.array;

        array[0] = quatl[3] * quatr[0] + quatl[0] * quatr[3] + quatl[1] * quatr[2] - quatl[2] * quatr[1];
        array[1] = quatl[3] * quatr[1] + quatl[1] * quatr[3] + quatl[2] * quatr[0] - quatl[0] * quatr[2];
        array[2] = quatl[3] * quatr[2] + quatl[2] * quatr[3] + quatl[0] * quatr[1] - quatl[1] * quatr[0];
        array[3] = quatl[3] * quatr[3] - quatl[0] * quatr[0] - quatl[1] * quatr[1] - quatl[2] * quatr[2];

        return q;
    };
}

//axis:[x, y, z]
Quaternion.AngleAxis = function(angle, axis) {
    var a = new Vector3(axis).normalized().array;

    var q = new Quaternion();
    var array = q.array;

    var cosv = Math.cos(Math.PI / 180 * angle * 0.5);
    var sinv = Math.sin(Math.PI / 180 * angle * 0.5);
    
    array[0] = a[0] * sinv;
    array[1] = a[1] * sinv;
    array[2] = a[2] * sinv;
    array[3] = cosv;

    return q;
};

//vec:[x, y, z]
Quaternion.Euler = function(vec) {
    var around_x = Quaternion.AngleAxis(vec[0], [1, 0, 0]);
    var around_y = Quaternion.AngleAxis(vec[1], [0, 1, 0]);
    var around_z = Quaternion.AngleAxis(vec[2], [0, 0, 1]);

    return around_y.multiply(around_x).multiply(around_z);
};