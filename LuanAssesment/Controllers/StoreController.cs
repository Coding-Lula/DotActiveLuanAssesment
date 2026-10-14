using LuanAssesment.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LuanAssesment.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/stores")]
    public class StoresController : ControllerBase
    {
        private readonly IStoreRepository _storeRepository;

        public StoresController(IStoreRepository storeRepository)
        {
            _storeRepository = storeRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StoreDto>>> GetStores()
        {
            // Extract claims set during login
            var roleName = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
            var province = User.FindFirst("province")?.Value;

            var stores = await _storeRepository.GetStoresByRoleAsync(roleName, province);

            // Map to DTO
            var storeDtos = stores.Select(s => new StoreDto(
                s.pkStoreId,
                s.sStoreCode,
                s.sStoreName,
                s.sDivision,
                s.sProvince,
                s.iOverduePlanograms
            ));

            return Ok(storeDtos);
        }
    }

    public record StoreDto(int Id, string StoreCode, string StoreName, string Division, string Province, int OverduePlanograms);
}
