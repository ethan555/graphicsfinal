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

float gradient_octaves2 (vec3 st) {
    float value = 0.0;
    float amplitude = 1.;
    for (int i = 0; i < 6; i++) {
        value += amplitude * gradient(st);
        st *= 2.;
        amplitude *= .4;
    }
    return value;
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

vec3 getStars (vec3 position, float t) {
    vec3 starposition = vec3(position * 500. + t);
    float starvalue = pow(.75 + gradient_octaves(starposition)*.5, 1.);
    vec3 stars = mix(vec3(0.,0.,0.), vec3(1.,1.,1.), smoothstep(0.99, 1.0, vec3(starvalue)));
    return clamp(stars, 0.0, 1.0);
}


void main() {

    vec3 position = vec3(world_position.x, world_position.y, world_position.z);
	float t = mod(time*0.2, 10000.);
	float value = 1.;
	vec4 color = vec4(1.);

    //vornoi water
    color = vec4(0.5, 0.1, 0., 1.);
    position *= .05;
    float contrast = .1;
    float dist = world_position.y;//minDist(position, t*1.5);

    // draw the min distance
    color += dist;
    color += gradient_octaves(position);

    // invert colors
    color = vec4(1. - color.r, 1. - color.g, 1. - color.b, 1.);
    color.g += .4;

    // contrast.
    contrast = .5;
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.)) + .5;

    // lightness.
    float lightness = .3;
    color.rgb += lightness;

    // almost saturation
    vec3 blue = vec3(0.,0.,1.);
    float saturation = .75;
    color.rgb = mix(blue, color.rgb, saturation);

    // contrast again
    contrast = 1.2;
    color.rgb = ((color.rgb - 0.5) * max(contrast, 0.)) + .5;

    // color again
    color -= 1.-dist;
    color.a = 1.;

    if (original_shader == 0.) {
        vec3 color_dist = color.xyz;//vec3(0.1, .9, .5);
        vec3 color_dist2 = color_dist.yzx;
        vec3 color_dist3 = color_dist.zxy;

        vec3 values = vec3(value);//, pow(value, 2.)*2., value);
        vec4 color1 = vec4(color_dist * values, value);
        vec4 color2 = vec4(color_dist2 * values.yzx, value);
        vec4 color3 = vec4(color_dist3 * values.zxy, value);
        //color.a = value;

        if (mouse_dx < .5) {
            color.xyz = mix(color1.xyz, color2.xyz, mouse_dx*2.);// + stars;
        } else {
            color.xyz = mix(color2.xyz, color3.xyz, (mouse_dx - .5)*2.);// + stars;
        }
    }

    fragment_color = color;//vec4( color * brightness);
}
)zzz"