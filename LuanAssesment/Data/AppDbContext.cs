using LuanAssesment.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace LuanAssesment.Data
{
        public class AppDbContext : DbContext
        {
            public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

            public DbSet<User> Users { get; set; }
            public DbSet<Role> Roles { get; set; }
            public DbSet<Store> Stores { get; set; }

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<Role>(entity =>
                {
                    entity.ToTable("tRoles");
                    entity.HasKey(e => e.pkRoleId);
                    entity.Property(e => e.pkRoleId).HasColumnName("pkRoleId");
                    entity.Property(e => e.sRoleName).HasColumnName("sRoleName").IsRequired();
                    entity.Property(e => e.sProvince).HasColumnName("sProvince");
                });

                modelBuilder.Entity<User>(entity =>
                {
                    entity.ToTable("tUsers");
                    entity.HasKey(e => e.pkUserId);
                    entity.Property(e => e.pkUserId).HasColumnName("pkUserId");
                    entity.Property(e => e.sUsername).HasColumnName("sUsername").IsRequired();
                    entity.Property(e => e.sPassword).HasColumnName("sPassword").IsRequired();
                    entity.Property(e => e.fkRoleId).HasColumnName("fkRoleId");

                    // Configure relationship
                    entity.HasOne(d => d.Role)
                          .WithMany(p => p.Users)
                          .HasForeignKey(d => d.fkRoleId)
                          .OnDelete(DeleteBehavior.Restrict);
                });

                modelBuilder.Entity<Store>(entity =>
                {
                    entity.ToTable("tStores");
                    entity.HasKey(e => e.pkStoreId);
                    entity.Property(e => e.pkStoreId).HasColumnName("pkStoreId");
                    entity.Property(e => e.sStoreCode).HasColumnName("sStoreCode").IsRequired();
                    entity.Property(e => e.sStoreName).HasColumnName("sStoreName").IsRequired();
                    entity.Property(e => e.sDivision).HasColumnName("sDivision").IsRequired();
                    entity.Property(e => e.sProvince).HasColumnName("sProvince").IsRequired();
                    entity.Property(e => e.iOverduePlanograms).HasColumnName("iOverduePlanograms");
                });
            }
        }
    }

