using LuanAssesment.Entities;

namespace LuanAssesment.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByUsernameAsync(string username);
    }
}
