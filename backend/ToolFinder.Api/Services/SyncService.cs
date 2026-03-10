using Microsoft.EntityFrameworkCore;
using ToolFinder.Api.Data;
using ToolFinder.Api.Models;

namespace ToolFinder.Api.Services;

public class SyncService(AppDbContext db, ToolService toolService)
{
    public async Task<SyncFlushResponse> FlushAsync(SyncFlushRequest request)
    {
        var results = new List<OfflineActionResult>();

        foreach (var action in request.Actions)
        {
            try
            {
                var tool = await db.Tools.FirstOrDefaultAsync(t => t.BarcodeId == action.BarcodeId);
                if (tool is null)
                {
                    results.Add(new(action.ActionId, false, $"Tool barcode '{action.BarcodeId}' not found"));
                    continue;
                }

                if (action.Type == OfflineActionType.Checkout)
                {
                    await toolService.CheckoutAsync(tool.Id);
                    results.Add(new(action.ActionId, true, null));
                }
                else // Checkin
                {
                    if (string.IsNullOrEmpty(action.LocationQrCode))
                    {
                        results.Add(new(action.ActionId, false, "LocationQrCode is required for checkin"));
                        continue;
                    }

                    var location = await db.Locations
                        .FirstOrDefaultAsync(l => l.QrCode == action.LocationQrCode);

                    if (location is null)
                    {
                        results.Add(new(action.ActionId, false, $"Location QR '{action.LocationQrCode}' not found"));
                        continue;
                    }

                    await toolService.CheckinAsync(tool.Id, location.Id);
                    results.Add(new(action.ActionId, true, null));
                }
            }
            catch (Exception ex)
            {
                results.Add(new(action.ActionId, false, ex.Message));
            }
        }

        return new SyncFlushResponse(results);
    }
}
