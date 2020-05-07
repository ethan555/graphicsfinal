#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float random(float x) {
    return random(vec2(x, x));
}

vec2 random2(vec2 st) {
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

vec3 random3(vec3 st) {
    st = vec3(dot(st,vec3(127.1,311.7,240.2)),
	      dot(st,vec3(269.5,183.3,346.5)),
	      dot(st,vec3(183.6,221.9,148.0)));
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float testNoise(vec2 st) {
    vec2 i = floor(st);  // integer
    vec2 f = fract(st);  // fraction
    //float y = random(st);
    //y = mix(rand(i), rand(i + 1.0), f);
    float y = mix(random(i), random(i + vec2(1.0, 1.0)), smoothstep(0.,1.,f.y));
    return y;
}

float gradient2D(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    vec2 u = f*f*f*(f*(f*6.-15.)+10.);
    //y = f*f*(3.0-2.0*f);

    return mix(
        mix(dot(random2(i + vec2(0.,0.)), f - vec2(0.,0.)),
            dot(random2(i + vec2(1.,0.)), f - vec2(1.,0.)), u.x),
        mix(dot(random2(i + vec2(0.,1.)), f - vec2(0.,1.)),
            dot(random2(i + vec2(1.,1.)), f - vec2(1.,1.)), u.x), u.y);
}

float gradient(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    vec3 u = f*f*f*(f*(f*6.-15.)+10.);
    //y = f*f*(3.0-2.0*f);

    return mix(mix(
        mix(dot(random3(i + vec3(0.,0.,0.)), f - vec3(0.,0.,0.)),
            dot(random3(i + vec3(1.,0.,0.)), f - vec3(1.,0.,0.)), u.x),
        mix(dot(random3(i + vec3(0.,1.,0.)), f - vec3(0.,1.,0.)),
            dot(random3(i + vec3(1.,1.,0.)), f - vec3(1.,1.,0.)), u.x), u.y),
	mix(mix(dot(random3(i + vec3(0.,0.,1.)), f - vec3(0.,0.,1.)),
            dot(random3(i + vec3(1.,0.,1.)), f - vec3(1.,0.,1.)), u.x),
        mix(dot(random3(i + vec3(0.,1.,1.)), f - vec3(0.,1.,1.)),
            dot(random3(i + vec3(1.,1.,1.)), f - vec3(1.,1.,1.)), u.x), u.y), u.z);
}

const mat3 rot1 = mat3(-0.37, 0.36, 0.85,-0.14,-0.93, 0.34,0.92, 0.01,0.4);
const mat3 rot2 = mat3(-0.55,-0.39, 0.74, 0.33,-0.91,-0.24,0.77, 0.12,0.63);
const mat3 rot3 = mat3(-0.71, 0.52,-0.47,-0.08,-0.72,-0.68,-0.7,-0.45,0.56);

float gradient_octaves(vec3 st) {
    return 0.6*gradient(st)
          +0.4*gradient(2.*st*rot1);
          //+0.1333333*gradient(4.*st*rot2);
          //+0.0666667*gradient(8.*st*rot3);
}

void main( void ) {

vec2 position = gl_FragCoord.xy / resolution.xy * 10.;// / resolution.xy;

float t = abs(1.0-cos(time*.1))*15.;
//float t = time % 10.;
//float t = time;

vec4 color = vec4(0., 0., 0., 0.);
    color.r = gradient(vec3(position, t));
    float value = 8.*pow(.5 + gradient_octaves(vec3(position.xx, t))*.5, 8.);
color.g = gradient(vec3(position+vec2(1.), t));
color.b = gradient(vec3(position-vec2(1.), t));

gl_FragColor = color;

}
