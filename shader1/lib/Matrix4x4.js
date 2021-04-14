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

function Matrix4x4() {
    this.array = new Float32Array(16);

    //right:Matrix4x4
    Matrix4x4.prototype.multiply = function(right) {
        var m = new Matrix4x4();
        var array = m.array;
        var matl = this.array;
        var matr = right.array;

        array[0] = matl[0] * matr[0] + matl[1] * matr[4] + matl[2] * matr[8] + matl[3] * matr[12];
        array[1] = matl[0] * matr[1] + matl[1] * matr[5] + matl[2] * matr[9] + matl[3] * matr[13];
        array[2] = matl[0] * matr[2] + matl[1] * matr[6] + matl[2] * matr[10] + matl[3] * matr[14];
        array[3] = matl[0] * matr[3] + matl[1] * matr[7] + matl[2] * matr[11] + matl[3] * matr[15];

        array[4] = matl[4] * matr[0] + matl[5] * matr[4] + matl[6] * matr[8] + matl[7] * matr[12];
        array[5] = matl[4] * matr[1] + matl[5] * matr[5] + matl[6] * matr[9] + matl[7] * matr[13];
        array[6] = matl[4] * matr[2] + matl[5] * matr[6] + matl[6] * matr[10] + matl[7] * matr[14];
        array[7] = matl[4] * matr[3] + matl[5] * matr[7] + matl[6] * matr[11] + matl[7] * matr[15];

        array[8] = matl[8] * matr[0] + matl[9] * matr[4] + matl[10] * matr[8] + matl[11] * matr[12];
        array[9] = matl[8] * matr[1] + matl[9] * matr[5] + matl[10] * matr[9] + matl[11] * matr[13];
        array[10] = matl[8] * matr[2] + matl[9] * matr[6] + matl[10] * matr[10] + matl[11] * matr[14];
        array[11] = matl[8] * matr[3] + matl[9] * matr[7] + matl[10] * matr[11] + matl[11] * matr[15];

        array[12] = matl[12] * matr[0] + matl[13] * matr[4] + matl[14] * matr[8] + matl[15] * matr[12];
        array[13] = matl[12] * matr[1] + matl[13] * matr[5] + matl[14] * matr[9] + matl[15] * matr[13];
        array[14] = matl[12] * matr[2] + matl[13] * matr[6] + matl[14] * matr[10] + matl[15] * matr[14];
        array[15] = matl[12] * matr[3] + matl[13] * matr[7] + matl[14] * matr[11] + matl[15] * matr[15];

        return m;
    };

    Matrix4x4.prototype.multiplyPoint3x4 = function(vec) {
        var x = vec[0];
        var y = vec[1];
        var z = vec[2];
        var vx, vy, vz;
        var array = this.array;

        vx = x*array[0] + y*array[1] + z*array[2] + array[3];
        vy = x*array[4] + y*array[5] + z*array[6] + array[7];
        vz = x*array[8] + y*array[9] + z*array[10] + array[11];

        return [vx, vy, vz];
    };
}

Matrix4x4.Identity = function() {
    var m = new Matrix4x4();
    var array = m.array;

    array[0] = 1; array[1] = 0; array[2] = 0; array[3] = 0;
    array[4] = 0; array[5] = 1; array[6] = 0; array[7] = 0;
    array[8] = 0; array[9] = 0; array[10] = 1; array[11] = 0;
    array[12] = 0; array[13] = 0; array[14] = 0; array[15] = 1;

    return m;
};

//vec:[x, y, z]
Matrix4x4.Translation = function(vec) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    array[3] = vec[0];
    array[7] = vec[1];
    array[11] = vec[2];

    return m;
};

//vec:[x, y, z]
Matrix4x4.Rotation = function(vec) {
    return Matrix4x4.RotationQ(Quaternion.Euler(vec).array);
};


//vecq:[x, y, z, w]
Matrix4x4.RotationQ = function(vecq) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    var x = vecq[0];
    var y = vecq[1];
    var z = vecq[2];
    var w = vecq[3];

    array[0] = 1 - 2 * y * y - 2 * z * z;
    array[4] = 2 * x * y + 2 * w * z;
    array[8] = 2 * x * z - 2 * w * y;

    array[1] = 2 * x * y - 2 * w * z;
    array[5] = 1 - 2 * x * x - 2 * z * z;
    array[9] = 2 * y * z + 2 * w * x;

    array[2] = 2 * x * z + 2 * w * y;
    array[6] = 2 * y * z - 2 * w * x;
    array[10] = 1 - 2 * x * x - 2 * y * y;

    return m;
};

//vec:[x, y, z]
Matrix4x4.Scaling = function(vec) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    array[0] = vec[0];
    array[5] = vec[1];
    array[10] = vec[2];

    return m;
};

//vect:[x, y, z]
//vecr:[x, y, z]
//vecs:[x, y, z]
Matrix4x4.TRS = function(vect, vecr, vecs) {
    var t = Matrix4x4.Translation(vect);
    var r = Matrix4x4.Rotation(vecr);
    var s = Matrix4x4.Scaling(vecs);

    return t.multiply(r).multiply(s);
};

//vect:[x, y, z]
//vecq:[x, y, z, w]
//vecs:[x, y, z]
Matrix4x4.TQS = function(vect, vecq, vecs) {
    var t = Matrix4x4.Translation(vect);
    var r = Matrix4x4.RotationQ(vecq);
    var s = Matrix4x4.Scaling(vecs);

    return t.multiply(r).multiply(s);
};

Matrix4x4.Ortho = function(left, right, bottom, top, near, far) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    var r_l = 1 / (right - left);
    var t_b = 1 / (top - bottom);
    var n_f = 1 / (near - far);

    array[0] = 2 * r_l;
    array[3] = -(right + left) * r_l;
    array[5] = 2 * t_b;
    array[7] = -(top + bottom) * t_b;

    //cvv 0~1
    array[10] = n_f;
    array[11] = near * n_f;

    return m;
};

Matrix4x4.Perspective = function(fov, aspect, z_near, z_far) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    var y_scale = 1 / Math.tan(Math.PI / 180 * fov / 2);
    var x_scale = y_scale / aspect;

    array[0] = x_scale;
    array[5] = y_scale;
    array[10] = (z_near + z_far) / (z_near - z_far);
    array[11] = 2 * z_near * z_far / (z_near - z_far);
    array[14] = -1.0;
    array[15] = 0;

    return m;
};

//eye_position:[x, y, z]
//to_direction:[x, y, z]
//up_direction:[x, y, z]
Matrix4x4.LookTo = function(eye_position, to_direction, up_direction) {
    var m = Matrix4x4.Identity();
    var array = m.array;

    var zaxis = new Vector3([-to_direction[0], -to_direction[1], -to_direction[2]]);
    zaxis.normalize();

    var xaxis = zaxis.multiply(new Vector3(up_direction));
    xaxis.normalize();

    var yaxis = xaxis.multiply(zaxis);

    var xa = xaxis.array;
    var ya = yaxis.array;
    var za = zaxis.array;
    var eye = new Vector3(eye_position);
    
    array[0] = xa[0]; array[1] = xa[1]; array[2] = xa[2]; array[3] = -xaxis.dot(eye);
    array[4] = ya[0]; array[5] = ya[1]; array[6] = ya[2]; array[7] = -yaxis.dot(eye);
    array[8] = za[0]; array[9] = za[1]; array[10] = za[2]; array[11] = -zaxis.dot(eye);
    array[12] = 0; array[13] = 0; array[14] = 0; array[15] = 1.0;

    return m;
};