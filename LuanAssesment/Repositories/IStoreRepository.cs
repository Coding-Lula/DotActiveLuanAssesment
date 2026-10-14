using LuanAssesment.Entities;

namespace LuanAssesment.Repositories
{
    public interface IStoreRepository
    {
        Task<IEnumerable<Store>> GetStoresByRoleAsync(string roleName, string? province);
    }
}
