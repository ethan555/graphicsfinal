R"zzz(
#version 330 core

in vec4 vertex_position;
in vec4 vertex_normal;

uniform float time;
uniform mat4 view;
uniform mat4 projection;
uniform vec4 light_position;
uniform float mouse_dy;
uniform float original_shader;

out vec4 light_direction;
out vec4 normal;
out vec4 world_position;
out vec4 color_normal;

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

float minDist(vec3 position, float t) {
    vec3 edge = floor(position);
    vec3 center = fract(position);
    float minDist = 1.;

    // loop through all the neighbors
    for (int x = -1; x <= 1; x++) {
        for (int y = -1; y <= 1; y++) {
            for (int z = -1; z <= 1; z++) {
                vec3 neighbor = vec3(float(x), float(y), float(z));
                vec3 border = random3(edge + neighbor);
                border = 0.5 + 0.5*sin(t + 6.2831*border);
                vec3 diff = neighbor + border - center;
                minDist = min(minDist, length(diff));
            }
        }
    }
    return minDist;
}

void main() {

    // To pass variables to the fragment shader, you assign them here in the
    // main function. Traditionally you name the varying with vAttributeName
    normal = vertex_normal;
    //vUv = uv;
    //vUv2 = uv2;
    world_position = vertex_position;
    light_direction = light_position - vertex_position;

    // water waves
    float t = mod(time*0.2, 10000.) * 1.5;
    float dist = minDist(world_position.xyz * .05, t);
    if (original_shader != 1.) {
        float mouse_y = (mouse_dy + .5) * 2.5;//1.25;
        gl_Position = projection * view * vec4( world_position.xyz + normal.xyz * dist * 1.5 * mouse_y, 1.0 );
        world_position.y = dist * mouse_y * .5;
    }
    else {
        gl_Position = projection * view * vec4( world_position.xyz + normal.xyz * dist * 1.5, 1.0 );
        world_position.y = dist;
    }
}
)zzz"