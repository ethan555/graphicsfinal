R"zzz(
#version 330 core
in vec4 normal;
in vec4 light_direction;
in vec4 color_normal;
in vec4 world_position;

out vec4 fragment_color;

uniform float time;
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

void main() {
    vec3 position = vec3(world_position.x, world_position.y, world_position.z);
    float t = mod(time*0.2, 10000.);
    float value = 1.;
    vec4 color = vec4(1.);

    // molten lava
    float scale = .15;
    if (original_shader == 0.) {
        scale = mouse_dy * .25+.1;
    }
    position *= scale;

    scale = 1.;
    if (original_shader == 0.) {
        scale = mouse_dx * 2.5+.5;
    }
    t *= scale;
    value = 2. * pow(9. * pow(.5 + gradient_octaves(vec3(position.x * 1.5, position.y * 1.5+t, position.z * 1.5)) * .6, 6.), 1.7);
    color.rgb = vec3(10. * value, .84 * value, .5 * value);

    // glow
    float t2 = abs(sin(mod(time *1., 1000.)));
    vec3 yellow = vec3(1.,.5,0.);
    float saturation = .8;
    vec3 yellowglow = mix(yellow, color.rgb, saturation);
    vec3 contrast = ((color.rgb - 0.5) * max(1., 0.)) + .5;
    color.rgb += (yellowglow+contrast) * t2;

    gl_FragColor = color;//vec4( color * brightness);

}
)zzz"