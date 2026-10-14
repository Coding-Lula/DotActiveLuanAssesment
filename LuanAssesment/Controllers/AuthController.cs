using LuanAssesment.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;

namespace LuanAssesment.Controllers
{ 
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;

        public AuthController(IUserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var user = await _userRepository.GetByUsernameAsync(model.Username);

            if (user == null || user.sPassword != model.Password)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            // Generate JWT Token including Role and Province claims
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "SuperSecretKeyForDotActivAssessment123!");

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                new Claim(ClaimTypes.Name, user.sUsername),
                new Claim(ClaimTypes.Role, user.Role.sRoleName),
                new Claim("province", user.Role.sProvince ?? string.Empty)
            }),
                Expires = DateTime.UtcNow.AddHours(4),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return Ok(new
            {
                token = tokenString,
                username = user.sUsername,
                role = user.Role.sRoleName,
                province = user.Role.sProvince
            });
        }
    }

    public record LoginDto(string Username, string Password);
}
