using LuanAssesment.Data;
using LuanAssesment.Entities;
using Microsoft.EntityFrameworkCore;
namespace LuanAssesment.Repositories
{
    public class StoreRepository: IStoreRepository
    {
        private readonly AppDbContext _context;
        public StoreRepository(AppDbContext context) => _context = context;

        public async Task<IEnumerable<Store>> GetStoresByRoleAsync(string roleName, string? province)
        {
            // Base query with AsNoTracking() for dashboard read-performance optimization
            var query = _context.Stores.AsNoTracking();

            // Server-side RBAC Filtering using LINQ
            query = roleName switch
            {
                "National Manager" => query, // Returns all stores
                "Western Cape Manager" => query.Where(s => s.sProvince == province),
                "Gauteng Manager" => query.Where(s => s.sProvince == province),
                _ => query.Where(s => false) // Fallback: return nothing if role is unrecognized
            };

            return await query.ToListAsync();
        }
    }
}
