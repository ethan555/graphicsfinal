R"zzz(
#version 330 core
// Set the precision for data types used in this shader
// precision highp float;
// precision highp int;

// Default THREE.js uniforms available to both fragment and vertex shader
// uniform mat4 modelMatrix;
// uniform mat4 ;
// uniform mat4 projectionMatrix;
// uniform mat4 viewMatrix;
// uniform mat3 normalMatrix;

// Default uniforms provided by ShaderFrog.
// uniform vec3 cameraPosition;
// uniform float time;

// A uniform unique to this shader. You can modify it to the using the form
// below the shader preview. Any uniform you add is automatically given a form
// uniform vec3 color;
// uniform vec3 lightPosition;

// Example varyings passed from the vertex shader
// varying vec3 vPosition;
// varying vec3 vNormal;
// varying vec2 vUv;
// varying vec2 vUv2;

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

void main() {
    // world stuff from ShaderFrog
    // vec3 worldPosition = ( modelMatrix * vec4( vPosition, 1.0 )).xyz;
    // vec3 worldNormal = normalize( vec3( modelMatrix * vec4( vNormal, 0.0 ) ) );
    // vec3 lightVector = normalize( lightPosition - worldPosition );
    // float brightness = dot( worldNormal, lightVector );

    vec3 position = vec3(world_position.xyz);
	float t = mod(time*0.2, 10000.);
	float value = 1.;
	vec4 color = vec4(1., 0., 0., 1.);

    // enchanted item
    float scale = .075;
    if (original_shader == 0.) {
        scale = mouse_dy*.2+.05;
    }
    position *= scale;
	t = mod(time * .7, 10000.) * .1;
    value = 5. * pow(.2 * pow(.5 + gradient_octaves2(vec3(position.x + t, position.y + t, position.z+ t)), 1.5), 1.5);
    color.rgb = vec3(0.6 * value, .5 * value, 1.8 * value);

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

    fragment_color = color;

}
)zzz"