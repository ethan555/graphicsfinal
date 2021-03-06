R"zzz(
#version 330 core

in vec4 vertex_position;
in vec4 vertex_normal;

uniform mat4 view;
uniform mat4 projection;
uniform vec4 light_position;
uniform vec2 resolution;
uniform float mouse_dx;
uniform float mouse_dy;
uniform float original_shader;

out vec4 light_direction;
out vec4 normal;
out vec4 world_position;
out vec4 color_normal;
out float yscale;

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

    // To pass variables to the fragment shader, you assign them here in the
    // main function. Traditionally you name the varying with vAttributeName
    normal = vertex_normal;
    world_position = vertex_position;
    light_direction = light_position - vertex_position;

    // This sets the position of the vertex in 3d space. The correct math is
    // provided below to take into account camera and object data.
    vec3 position = vertex_position.xyz;// * .05;
    float scale = .05;
    if (original_shader == 0.) {
        scale = mouse_dx*.09+.01;
    }
    float e = 1. * gradient_octaves(position * scale) +  0.5 * gradient_octaves(2. * position * scale) + 0.25 * gradient_octaves(vec3(4. * position.x * scale, 2. * position.y * scale, position.z * scale));
    /*if (e == 0.) world_position.y = 0.;
    else if (e > 0.) world_position.y = 10.;
    else world_position.y = -10.;*/
    float mouse_y = 1.;
    if (original_shader != 1.) mouse_y = (mouse_dy + .5) * 1.25;
    yscale = 10.*mouse_y;
    world_position.y = e*yscale;
    gl_Position = projection * view * vec4(world_position.xyz, 1.0);

}
)zzz"
