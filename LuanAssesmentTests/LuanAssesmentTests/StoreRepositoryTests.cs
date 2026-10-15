using Microsoft.EntityFrameworkCore;
using LuanAssesment.Entities;
using LuanAssesment.Data;
using LuanAssesment.Repositories;

namespace LuanAssesmentTests
{
    public class StoreRepositoryTests
    {
        [Fact]
        public async Task GetStoresByRoleAsync_WesternCapeManager_ReturnsOnlyWesternCapeStores()
        {
            // Arrange: Set up an in-memory database with test data
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "DotActivTestDb_WC")
                .Options;

            using (var context = new AppDbContext(options))
            {
                context.Stores.AddRange(
                    new Store { pkStoreId = 1, sStoreCode = "S01", sStoreName = "Store 1", sDivision = "Retail", sProvince = "Western Cape", iOverduePlanograms = 1 },
                    new Store { pkStoreId = 2, sStoreCode = "S02", sStoreName = "Store 2", sDivision = "Retail", sProvince = "Gauteng", iOverduePlanograms = 0 }
                );
                await context.SaveChangesAsync();
            }

            // Act: Execute repository query for Western Cape Manager
            IEnumerable<Store> results;
            using (var context = new AppDbContext(options))
            {
                var repository = new StoreRepository(context);
                results = await repository.GetStoresByRoleAsync("Western Cape Manager", "Western Cape");
            }

            // Assert: Verify only Western Cape stores are returned
            Assert.NotNull(results);
            Assert.Single(results);
            Assert.Equal("Western Cape", results.First().sProvince);
        }

        [Fact]
        public async Task GetStoresByRoleAsync_NationalManager_ReturnsAllStores()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "DotActivTestDb_National")
                .Options;

            using (var context = new AppDbContext(options))
            {
                context.Stores.AddRange(
                    new Store { pkStoreId = 1, sStoreCode = "S01", sStoreName = "Store 1", sDivision = "Retail", sProvince = "Western Cape", iOverduePlanograms = 1 },
                    new Store { pkStoreId = 2, sStoreCode = "S02", sStoreName = "Store 2", sDivision = "Retail", sProvince = "Gauteng", iOverduePlanograms = 0 }
                );
                await context.SaveChangesAsync();
            }

            // Act
            IEnumerable<Store> results;
            using (var context = new AppDbContext(options))
            {
                var repository = new StoreRepository(context);
                results = await repository.GetStoresByRoleAsync("National Manager", null);
            }

            // Assert: Verify all stores are returned
            Assert.NotNull(results);
            Assert.Equal(2, results.Count());
        }
    }
}
