attribute   vec3 position;
attribute   float ratio;
uniform     float time;
varying     vec3 vColor;

const float PI = 3.1415926;
const float RADIUS = 0.5;

// HSV カラーを生成
vec3 hsvColor(float h, float s, float v)
{
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
}

float sinWave(float timeScale, float waveLength, float waveHeight)
{
    float t = ratio + time * timeScale;
    float s = sin(2.0 * PI * waveLength * t);
    return s * waveHeight;
}

void main()
{
    float wave = sinWave(0.1, 8.0, 0.025);
    float radius = RADIUS + wave;

    float radian = PI * 2.0 * ratio;
    float s = sin(radian) * radius;
    float c = cos(radian) * radius;
    vec3 p = vec3(c, s, 0.0);

    vColor = hsvColor(ratio, 1.0, 1.0);

    gl_Position = vec4(position + p, 1.0);
    gl_PointSize = 5.0;
}
