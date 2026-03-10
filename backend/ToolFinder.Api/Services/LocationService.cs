using Microsoft.EntityFrameworkCore;
using ToolFinder.Api.Data;
using ToolFinder.Api.Models;

namespace ToolFinder.Api.Services;

public class LocationService(AppDbContext db)
{
    public async Task<List<LocationDto>> GetTreeAsync()
    {
        var all = await db.Locations.AsNoTracking().ToListAsync();
        return BuildTree(all, null);
    }

    public async Task<LocationDto?> GetByIdAsync(int id)
    {
        var all = await db.Locations.AsNoTracking().ToListAsync();
        var location = all.FirstOrDefault(l => l.Id == id);
        return location is null ? null : MapDto(location, all);
    }

    public async Task<LocationDto?> GetByQrCodeAsync(string qrCode)
    {
        var all = await db.Locations.AsNoTracking().ToListAsync();
        var location = all.FirstOrDefault(l => l.QrCode == qrCode);
        return location is null ? null : MapDto(location, all);
    }

    public async Task<LocationDto> CreateAsync(CreateLocationRequest req)
    {
        var qrCode = Guid.NewGuid().ToString("N");
        var location = new Location
        {
            QrCode = qrCode,
            Name = req.Name,
            Description = req.Description,
            PhotoUrl = req.PhotoUrl,
            ParentLocationId = req.ParentLocationId,
        };
        db.Locations.Add(location);
        await db.SaveChangesAsync();

        var all = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(location, all);
    }

    public async Task<LocationDto?> UpdateAsync(int id, UpdateLocationRequest req)
    {
        var location = await db.Locations.FindAsync(id);
        if (location is null) return null;

        location.Name = req.Name;
        location.Description = req.Description;
        location.PhotoUrl = req.PhotoUrl;
        location.ParentLocationId = req.ParentLocationId;
        await db.SaveChangesAsync();

        var all = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(location, all);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var location = await db.Locations.FindAsync(id);
        if (location is null) return false;
        db.Locations.Remove(location);
        await db.SaveChangesAsync();
        return true;
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static List<LocationDto> BuildTree(List<Location> all, int? parentId)
    {
        return all
            .Where(l => l.ParentLocationId == parentId)
            .Select(l => MapDto(l, all))
            .ToList();
    }

    private static LocationDto MapDto(Location l, List<Location> all) =>
        new(l.Id, l.QrCode, l.Name, l.Description, l.PhotoUrl,
            l.ParentLocationId, BuildTree(all, l.Id));

    public static string BuildPath(int? locationId, List<Location> all)
    {
        if (locationId is null) return string.Empty;
        var parts = new List<string>();
        var current = all.FirstOrDefault(l => l.Id == locationId);
        while (current is not null)
        {
            parts.Insert(0, current.Name);
            current = current.ParentLocationId.HasValue
                ? all.FirstOrDefault(l => l.Id == current.ParentLocationId)
                : null;
        }
        return string.Join(" > ", parts);
    }
}
