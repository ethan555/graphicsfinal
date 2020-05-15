R"zzz(
#version 330 core
in vec4 normal;
in vec4 light_direction;
in vec4 color_normal;
in vec4 world_position;
out vec4 fragment_color;
void main()
{
    // When this gets smaller, squares get bigger, vice versa
    float square_inverse_size = 1.;
    vec2 position = ( world_position.xz ) * square_inverse_size;

	float color = mod(floor(mod(position.x, 2.)) + floor(mod(position.y, 2.)), 2.);
	float dot_nl = dot(normalize(light_direction), normalize(color_normal));
	dot_nl = clamp(dot_nl, 0.0, 1.0);

    color = color * dot_nl;

	fragment_color = vec4( color, color, color, 1.0 );
}
)zzz"