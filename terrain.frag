R"zzz(
#version 330 core
/**
* ShaderFrog Fragment Shader
*/

/*// Set the precision for data types used in this shader
precision highp float;
precision highp int;

// Default THREE.js uniforms available to both fragment and vertex shader
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;

// Default uniforms provided by ShaderFrog.
uniform vec3 cameraPosition;
// uniform float time;

// A uniform unique to this shader. You can modify it to the using the form
// below the shader preview. Any uniform you add is automatically given a form
uniform vec3 color;
uniform vec3 lightPosition;

// Example varyings passed from the vertex shader
varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
varying vec2 vUv2;*/

in vec4 normal;
in vec4 light_direction;
in vec4 color_normal;
in vec4 world_position;
in float yscale;

out vec4 fragment_color;

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
    vec3 worldPosition = world_position.xyz;
    vec3 worldNormal = normal.xyz;
    vec3 lightVector = light_direction.xyz;
    float brightness = dot( worldNormal, lightVector );

    vec3 position = vec3(world_position.xyz);
	float value = 1.;
	vec4 color = vec4(1., 0., 0., 1.);

    // terrain coloring
    position *= .05;

    // elevation
    float e = position.y / .75;  //1. * gradient_octaves(position) +  0.5 * gradient_octaves(2. * position) + 0.25 * gradient_octaves(vec3(4. * position.x, 2. * position.y, position.z));
    // e = clamp(e, -1., 1.);

    // change random seed
    position = vec3(position.zyx) * 4.;

    // moisture
    float m = gradient_octaves(position) +  0.5 * gradient_octaves(2. * position);
    m = clamp(m, -1., 1.);

    if (e < .0) // water
        if (e < -.15) color = vec4(0., 0., .7, 1.); // deepest
        else if (e < -.05) color = vec4(0., 0., .9, 1.); // deep
        else color = vec4(0.2, 0.4, 1.5, 1.); // shallow

    else  { // land
        if (e > .23) { // mountain
            if (m < -.02) color = vec4(1., 1., 1., 1.); // scorched
            else if (m < 0.15) color = vec4(.9, 1., .9, 1.); // bare;
            else color = vec4(.8, .9, .8, 1.); // tundra;
        }
        else if (e > .15)  { // hill
            if (m < -.05) color = vec4(0.8, 1., 0.8, 1.);// TEMPERATE_DESERT
            else if (m < 0.1) color = vec4(0.7, .9, 0.7, 1.);// SHRUBLAND
            else color = vec4(0.4, .8, 0.4, 1.); // taiga
        }
        else if (e > .025) { // plains
            if (m < -0.06)  color = vec4(0.5, .9, 0.5, 1.); //  TEMPERATE_DESERT
            else if (m < 0.05) color = vec4(0.3, .8, 0.3, 1.); // GRASSLAND
            else if (m < 0.2) color = vec4(0.3, .7, 0.3, 1.); //  TEMPERATE_DECIDUOUS_FOREST
            else color = vec4(0.2, .6, 0.3, 1.); // TEMPERATE_RAIN_FOREST
        }
        else color = vec4(.9, .85, 0.6, 1.); // beach
    }

    /*if (e < .001 && e > -.001) color = vec4(0., 0., 1., e); // blue e = 0
    else if (e < 0.) color = vec4(0., 1., 0., e); // green e = negative
    else color = vec4(1., 0., .0, e); // red e = positive*/

    fragment_color = color;//vec4( color * brightness);

}
)zzz"