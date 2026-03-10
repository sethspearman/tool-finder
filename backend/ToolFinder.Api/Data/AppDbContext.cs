using Microsoft.EntityFrameworkCore;
using ToolFinder.Api.Models;

namespace ToolFinder.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Tool> Tools => Set<Tool>();
    public DbSet<CheckoutLog> CheckoutLogs => Set<CheckoutLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Location — self-referential hierarchy
        modelBuilder.Entity<Location>(e =>
        {
            e.HasKey(l => l.Id);
            e.Property(l => l.QrCode).IsRequired().HasMaxLength(200);
            e.HasIndex(l => l.QrCode).IsUnique();
            e.Property(l => l.Name).IsRequired().HasMaxLength(200);

            e.HasOne(l => l.ParentLocation)
             .WithMany(l => l.Children)
             .HasForeignKey(l => l.ParentLocationId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Tool
        modelBuilder.Entity<Tool>(e =>
        {
            e.HasKey(t => t.Id);
            e.Property(t => t.BarcodeId).IsRequired().HasMaxLength(200);
            e.HasIndex(t => t.BarcodeId).IsUnique();
            e.Property(t => t.DisplayName).IsRequired().HasMaxLength(300);

            e.HasOne(t => t.CurrentLocation)
             .WithMany(l => l.Tools)
             .HasForeignKey(t => t.CurrentLocationId)
             .OnDelete(DeleteBehavior.SetNull);

            // PostgreSQL generated tsvector column — kept in sync by the DB engine
            e.HasGeneratedTsVectorColumn(
                t => t.SearchVector!,
                "english",
                t => new { t.DisplayName, t.Description })
             .HasIndex(t => t.SearchVector)
             .HasMethod("GIN");
        });

        // CheckoutLog
        modelBuilder.Entity<CheckoutLog>(e =>
        {
            e.HasKey(c => c.Id);

            e.HasOne(c => c.Tool)
             .WithMany(t => t.CheckoutLogs)
             .HasForeignKey(c => c.ToolId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.ReturnedToLocation)
             .WithMany()
             .HasForeignKey(c => c.ReturnedToLocationId)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
