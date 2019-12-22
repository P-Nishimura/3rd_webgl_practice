window.addEventListener('DOMContentLoaded', () => {
    let webgl = new WebGLFrame();

    webgl.init('webgl-canvas');

    webgl.load().then(() => {
        webgl.setup();
        webgl.render();
    });
}, false);


class WebGLFrame
{

    constructor(){
        this.canvas     = null;
        this.gl         = null;
        this.running    = false;
        this.begginTime = 0;
        this.nowTime    = 0;

        this.render = this.render.bind(this);
    }

    init(canvas){
        if (canvas instanceof HTMLCanvasElement === true){
            this.canvas = canvas;
        }else if(Object.prototype.toString.call(canvas) === '[object String]'){
            let new_canvas = document.querySelector(`#${canvas}`);
            this.canvs = new_canvas;
        }

        if(this.canvas == null){
            throw new Error('invalid argument');
        }

        this.gl = this.canvas.getContext('webgl');
        if(this.gl == null){
            throw new Error('webgl not supported.');
        }
    }

    load(){
        // シェーダやテクスチャ用画像を非同期で取得する
    }

    setup(){
        // レンダリングの前準備
    }

    render(){
        // レンダリング
    }

    /**
     * シェーダのソースコードを外部ファイルから取得する
     * @param {Array.<string>} source   シェーダソースコードパス
     * @return {Promse} 
     */
    loadShader(pathArray){
        if(Array.isArray(pathArray) !== true){
            throw new Error('invalid argument');
        }

        let promises = pathArray.map((path) => {
            return fetch(path).then((response) => {
                return response.text();
            });
        })

        return Promise.all(promises);
    }

    /**
     * シェーダオブジェクトを生成して返す。
     * コンパイルに失敗した場合は失敗理由をアラート, nullを返す。
     * @param {string} source   - シェーダのソースコード文字列
     * @param {number} shader_type     - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
     * @return {WebGLShader}    - シェーダオブジェクト
     */
    createShader(source, shader_type){
        if(this.gl === null){
            throw new Error('webgl not initialized');
        }

        let gl = this.gl;
        let shader = gl.createShader(shader_type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            return shader;
        }else{
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /**
     * プログラムオブジェクトを生成して返す。
     * シェーダのリンクに失敗した場合はアラートし、nullを返す
     * @param {WebGLShader} vertex      - 頂点シェーダオブジェクト
     * @param {WebGLShader} fragment    - フラグメントシェーダオブジェクト
     * @return {WebGLProgram} プログラムオブジェクト
     */
    crateProgram(vertex, fragment){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }

        let gl = this.gl;
        let program = gl.createProgram();
        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgarm();

        if(gl.getProgramParameter(program, gl.LINK_STATUS)){
            gl.useProgram(program);
            return program;
        }else{
            alert(gl.getProgramInfoLog(program));
            return null;
        }
    }

    /**
     * unoform 変数をまとめてシェーダに送る
     * @param {Array} value - 各変数の値 
     * @param {Array} uniL  - uniform Location を格納した配列
     * @param {Array} uniT  - uniform 変数のタイプを格納した配列
     */
    setUniform(value, uniL, uniT){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }
        
        let gl = this.gl;
        value.forEach((value, index) => {
            let type = unitL[index];
            if(type.includes('Matrix') === true){
                gl[type](uniL[index], false, v);
            }else{
                gl[type](uniL[index], value);
            }
        });
    }

    /**
     * VBOを生成して返す    (Vertex Buffer Object)
     * @param {Array} vertex_attribute  - 頂点属性データを格納した配列
     * @return {WebGLBuffer}    VBO
     */
   createVbo(vertex_attribute){
       if(this.gl == null){
           throw new Error('webgl not initialized');
       }

       let gl = this.gl;
       let vbo = gl.createBuffer();
       gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
       gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_attribute), gl.STATIC_DRAW);

       // GPU側にバッファーを登録したのち次のデータを受け入れるため、バッファーを空にする
       gl.bindBuffer(gl.ARRAY_BUFFER, null);

       return vbo;
   } 

   /**
    * IBOを生成して返す
    * @param {Array} data   - インデックスデータを格納した配列
    * @return {WebGLBuffer} IBO
    */
   createIbo(data){
       if(this.gl == null){
           throw new Error('webgl not initialized');
       }

       let gl = this.gl;
       let ibo = gl.createBuffer();
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
       gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

       return ibo;
   }

   /**
    * IBOを生成して返す（INT拡張）
    * @param {Array} data   - インデックスデータを格納した配列
    * @return {WebGLBuffer} IBO
    */
   createIboInt(data){
       if(this.gl == null){
           throw new Error('webgl not initialized.');
       }

       let gl = this.gl;
       if(ext == null || ext.elementIndexUnit == null){
           throw new Error('element index unit not supported.');
       }

       let ibo = gl.createBuffer();
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
       gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(data), gl.STATIC_DRAW);
       gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

       return ibo;
   }

   /**
    * VBO を IBO にバインドし有効化する
    * @param {Array} vbo    - VBOを格納した配列
    * @param {Array} attL   - attribute location を格納した配列
    * @param {Array} attS   - attrubute stride を格納した配列
    * @param {WebGLBuffer} ibo - IBO
    */
   setAttribute(vbo, attL, attS, ibo){
        if(this.gl == null){
            throw new Error('webgl not initialized.');
        }

        let gl = this.gl;
        vbo.forEach((value, index) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, value);
            gl.enableVertexAttribArray(attL[index]);
            gl.vertexAttribPointer(attL[index], attS[index], gl.FROAT, false, 0, 0);
        });

        if(ibo != null){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        }
   }

   /**
    * 画像ファイルを読み込み、テクスチャを生成してコールバックで返却する
    * @param {string} source  - ソースとなるファイルパス
    * @return {Promise}       - プロミスオブジェクト
    */
   createTextureFromFile(source){
       if(this.gl == null){
           throw new Error('webgl not initialized.');
       }

       return new Promise((resolve) => {
           let gl = this.gl;
           let img = new Image();

           img.addEventListener('load', () => {
               let texture = gl.createTexture();
               gl.bindTexture(gl.TEXTURE_2D, texture);
               gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
               gl.generateMipmap(gl.TEXTURE_2D);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILER, gl.LINEAR);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILER, gl.LINEAR);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
               gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
               gl.bindTexture(gl.texImage2D, null);
               resolve(texture);
           }, false);
           img.src = source;
       });
   }

   /**
    * フレームバッファを生成して返す。
    * @param {number} width     - フレームバッファの幅
    * @param {number} height    - フレームバッファの高さ
    * @return {object} 生成した各種オブジェクトはラップして返す
    * @property {WebGLFrameBuffer} framebuffer      - フレームバッファ
    * @property {WebGLRenderBuffer} renderbuffer    - 深度バッファとして設定したレンダーバッファ
    * @property {WebGLTexture} texture              -カラーバッファとして設定したテクスチャ
    */
    createFramebuffer(width, height){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }

        let gl = this.gl;

        // フレームバッファーオブジェクトの生成
        let framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // レンダーバッファーオブジェクトを生成
        let depthRenderbuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);

        // カラーバッファオブジェクトを生成
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl,texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.texImage2D, gl,TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, g.COLORE_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);

        // 各種バッファの初期化
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {
            framebuffer: framebuffer
            ,renderbunffer: depthRenderbuffer
            ,texture: fTexture
        };
    }

    /**
     * フレームバッファを生成して返す。（フロートテクスチャ版）
     * @param {object} ext - getWebGLExtensions の戻り値
     * @param {number} width - フレームバッファの幅
     * @param {number} height - フレームバッファの高さ
     * @return {object} 生成した各種オブジェクトはラップして返却する
     * @property {WebGLFramebuffer} framebuffer - フレームバッファ
     * @property {WebGLTexture} texture - カラーバッファとして設定したテクスチャ
     */
    createFramebufferFloat(ext, width, height){
        if (this.gl == null){
            throw new Error('webgl is not initialized.');
        }

        let gl = this.gl;
        if(ext == null || (ext.textureFloat == null && ext.textureHalfFloat == null)){
            throw new Error('float texture not supported');
        }

        let flg = (ext.textureFloat != null) ? gl.FROAT : ext.textureHalfFloat.HALF_FLOAT_OES;

        let framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, flg, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        return {framebuffer: frameBuffer, texture: fTexture};
    }

    /**
     * 主要なWebGLの拡張機能を取得する
     * @return {object} 取得した拡張機能
     * @property {object}   elementIndexUnit    - Unit32 フォーマットを利用できるようになる
     * @property {object}   textureFloat        - フロートテクスチャを利用できるようになる
     * @property {object}   textureHalfFloat    - ハーフフロートテクスチャを利用できるようになる
     */
    getWebGLExtentions(){
        if(this.gl == null){
            throw new Error('webgl not initialized');
        }

        let gl = this.gl;

        return {
            elementIndexUnit:   gl.getExtension('OES_element_index_uint'),
            textureFloat:       gl.getExtension('OES_texture_float'),
            textureHalfFloat:   gl.getExtension('OES_texture_half_float')
        };
    }
}