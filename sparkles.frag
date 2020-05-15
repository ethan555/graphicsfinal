R"zzz(
#version 330 core
// #ifdef GL_ES
// precision mediump float;
// #endif

// #extension GL_OES_standard_derivatives : enable
in vec4 normal;
in vec4 light_direction;
in vec4 color_normal;
in vec4 world_position;

out vec4 fragment_color;

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float mouse_dx;
uniform float mouse_dy;
uniform float original_shader;

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233)))* 43758.5453123);
}

float random(float x) {
    return random(vec2(x, x));
}

vec2 random2(vec2 st){
    st = vec2( dot(st,vec2(127.1,311.7)),
              dot(st,vec2(269.5,183.3)) );
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

vec3 random3(vec3 st){
    st = vec3(dot(st,vec3(127.1,311.7,240.2)),
	      dot(st,vec3(269.5,183.3,346.5)),
	      dot(st,vec3(183.6,221.9,148.0)));
    return -1.0 + 2.0*fract(sin(st)*43758.5453123);
}

float gradient(vec3 st) {
    vec3 i = floor(st);
    vec3 f = fract(st);

    // Quintic
    vec3 u = f*f*f*(f*(f*6.-15.)+10.);

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
    //vec2 position = gl_FragCoord.xy / resolution.xy * 2.;// / resolution.xy;
    //vec2 position = ( world_position.xz ) / resolution.xy * 2.;
    float mouse_x;
    float mouse_y;
    if (original_shader > 0.) {
        mouse_x = 0.;
        mouse_y = 0.;
    } else {
        mouse_x = mouse_dx;
        mouse_y = mouse_dy;
    }
    vec3 position = vec3(world_position.xyz) * (.2 + mouse_y);

    vec4 color = vec4(0., 0., 0., 0.);
    float t = mod(time*0.15, 10000.);
    float t2 = mod(time*0.025, 10000.);
    //vec3 randposition = vec3(position.x+t+t*position.y/2., position.x*t+t+position.y/8., t);
    vec3 randposition = vec3(position.x+t+t*position.x, position.y+t+position.y*t, position.z+t+t*position.z);
    float value = 4.*pow(6.*pow(.5 + gradient_octaves(randposition)*.5, 6.), 2.);
    float value2 = 4.*pow(6.*pow(.5 + gradient_octaves(vec3(randposition.xy*2.,randposition.z))*.5, 6.), 2.);
    vec3 color_dist = vec3(0.35, .5, 1.);
    vec3 color_dist2 = color_dist.yzx;
    vec3 color_dist3 = color_dist.zxy;
    color.a = value;

    vec3 values1 = vec3(pow(value, 2.), pow(value, 4.), value);
    vec3 values2 = vec3(value2, pow(value2, 4.), value2);
    vec3 color1 = color_dist * mix(values1,values2,.5);//vec4(color_dist * vec3(value), value);
    vec3 color2 = color_dist2 * mix(values1.yzx,values2.yzx,.5);//vec4(color_dist2 * vec3(value), value);
    vec3 color3 = color_dist3 * mix(values1.zxy,values2.zxy,.5);//vec4(color_dist3 * vec3(value), value);

    if (mouse_x < .5) {
        color.xyz = mix(color1.xyz, color2.xyz, mouse_x);
    } else {
        color.xyz = mix(color2.xyz, color3.xyz, (mouse_x - .5));
    }
    //color.rgb = color_dist * mix(vec3(pow(value, 2.), pow(value, 4.), value),vec3(value2, pow(value2, 4.), value2),.5);

    fragment_color = color;

}
)zzz"
