precision mediump float;

uniform vec4 globalColor;

varying vec3 vColor;


void main()
{
    gl_FragColor = globalColor * vec4(vColor, 1.0);
}
