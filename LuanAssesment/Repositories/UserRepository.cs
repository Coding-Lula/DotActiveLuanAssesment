using LuanAssesment.Data;
using LuanAssesment.Entities;
using Microsoft.EntityFrameworkCore;

namespace LuanAssesment.Repositories
{
    public class UserRepository:IUserRepository
    {
        private readonly AppDbContext _context;
        public UserRepository(AppDbContext context) => _context = context;

        public async Task<User?> GetByUsernameAsync(string username)
        {
            return await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.sUsername == username);
        }
    }
}
