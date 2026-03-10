using Microsoft.EntityFrameworkCore;
using ToolFinder.Api.Data;
using ToolFinder.Api.Models;

namespace ToolFinder.Api.Services;

public class ToolService(AppDbContext db)
{
    public async Task<List<ToolDto>> GetAllAsync()
    {
        var locations = await db.Locations.AsNoTracking().ToListAsync();
        var tools = await db.Tools.AsNoTracking().ToListAsync();
        return tools.Select(t => MapDto(t, locations)).ToList();
    }

    public async Task<ToolDto?> GetByIdAsync(int id)
    {
        var tool = await db.Tools.AsNoTracking().FirstOrDefaultAsync(t => t.Id == id);
        if (tool is null) return null;
        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<ToolDto?> GetByBarcodeAsync(string barcodeId)
    {
        var tool = await db.Tools.AsNoTracking().FirstOrDefaultAsync(t => t.BarcodeId == barcodeId);
        if (tool is null) return null;
        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<List<ToolDto>> SearchAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return await GetAllAsync();

        // PostgreSQL full-text search via tsvector
        var tools = await db.Tools
            .AsNoTracking()
            .Where(t => t.SearchVector!.Matches(EF.Functions.ToTsQuery("english", query + ":*")))
            .ToListAsync();

        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return tools.Select(t => MapDto(t, locations)).ToList();
    }

    public async Task<ToolDto> CreateAsync(CreateToolRequest req)
    {
        var tool = new Tool
        {
            BarcodeId = req.BarcodeId,
            DisplayName = req.DisplayName,
            Description = req.Description,
            HandwrittenId = req.HandwrittenId,
            UpcCode = req.UpcCode,
            PhotoUrl = req.PhotoUrl,
        };
        db.Tools.Add(tool);
        await db.SaveChangesAsync();

        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<ToolDto?> UpdateAsync(int id, UpdateToolRequest req)
    {
        var tool = await db.Tools.FindAsync(id);
        if (tool is null) return null;

        tool.DisplayName = req.DisplayName;
        tool.Description = req.Description;
        tool.HandwrittenId = req.HandwrittenId;
        tool.UpcCode = req.UpcCode;
        tool.PhotoUrl = req.PhotoUrl;
        await db.SaveChangesAsync();

        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var tool = await db.Tools.FindAsync(id);
        if (tool is null) return false;
        db.Tools.Remove(tool);
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<ToolDto?> PlaceAsync(int id, int locationId)
    {
        var tool = await db.Tools.FindAsync(id);
        if (tool is null) return null;

        tool.CurrentLocationId = locationId;
        tool.IsCheckedOut = false;
        await db.SaveChangesAsync();

        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<ToolDto?> CheckoutAsync(int id)
    {
        var tool = await db.Tools.FindAsync(id);
        if (tool is null) return null;

        var log = new CheckoutLog
        {
            ToolId = id,
            CheckedOutAt = DateTimeOffset.UtcNow,
        };
        db.CheckoutLogs.Add(log);

        tool.IsCheckedOut = true;
        tool.CurrentLocationId = null;
        await db.SaveChangesAsync();

        return MapDto(tool, []);
    }

    public async Task<ToolDto?> CheckinAsync(int id, int locationId)
    {
        var tool = await db.Tools
            .Include(t => t.CheckoutLogs.OrderByDescending(l => l.CheckedOutAt).Take(1))
            .FirstOrDefaultAsync(t => t.Id == id);
        if (tool is null) return null;

        var openLog = tool.CheckoutLogs.FirstOrDefault(l => l.CheckedInAt is null);
        if (openLog is not null)
        {
            openLog.CheckedInAt = DateTimeOffset.UtcNow;
            openLog.ReturnedToLocationId = locationId;
        }

        tool.IsCheckedOut = false;
        tool.CurrentLocationId = locationId;
        await db.SaveChangesAsync();

        var locations = await db.Locations.AsNoTracking().ToListAsync();
        return MapDto(tool, locations);
    }

    public async Task<ImportSummary> BulkImportAsync(List<Dictionary<string, string>> rows)
    {
        int created = 0, skipped = 0, errors = 0;
        var results = new List<ImportRowResult>();
        var rowNum = 1;

        foreach (var row in rows)
        {
            rowNum++;
            try
            {
                var name = row.GetValueOrDefault("Name", "").Trim();
                if (string.IsNullOrEmpty(name))
                {
                    results.Add(new(rowNum, false, null, "Name is required"));
                    errors++;
                    continue;
                }

                var barcode = Guid.NewGuid().ToString("N");
                var tool = new Tool
                {
                    BarcodeId = barcode,
                    DisplayName = name,
                    Description = row.GetValueOrDefault("Description"),
                    HandwrittenId = row.GetValueOrDefault("HandwrittenId"),
                    UpcCode = row.GetValueOrDefault("UpcCode"),
                };
                db.Tools.Add(tool);
                await db.SaveChangesAsync();
                results.Add(new(rowNum, true, name, null));
                created++;
            }
            catch (Exception ex)
            {
                results.Add(new(rowNum, false, null, ex.Message));
                errors++;
            }
        }

        return new ImportSummary(created, skipped, errors, results);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private static ToolDto MapDto(Tool t, List<Location> locations) =>
        new(t.Id, t.BarcodeId, t.DisplayName, t.Description,
            t.HandwrittenId, t.UpcCode, t.PhotoUrl,
            t.CurrentLocationId,
            LocationService.BuildPath(t.CurrentLocationId, locations),
            t.IsCheckedOut);
}
