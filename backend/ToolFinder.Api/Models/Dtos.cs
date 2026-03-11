namespace ToolFinder.Api.Models;

// ── Locations ──────────────────────────────────────────────────────────────

public record LocationDto(
    int Id,
    string QrCode,
    string Name,
    string? Description,
    string? PhotoUrl,
    int? ParentLocationId,
    List<LocationDto> Children
);

public record CreateLocationRequest(
    string Name,
    string? Description,
    string? PhotoUrl,
    int? ParentLocationId,
    string? QrCode = null    // pre-scanned from a printed label; generated if omitted
);

public record UpdateLocationRequest(
    string Name,
    string? Description,
    string? PhotoUrl,
    int? ParentLocationId
);

// ── Tools ──────────────────────────────────────────────────────────────────

public record ToolDto(
    int Id,
    string BarcodeId,
    string DisplayName,
    string? Description,
    string? HandwrittenId,
    string? UpcCode,
    string? PhotoUrl,
    int? CurrentLocationId,
    string? LocationPath,   // e.g. "Garage > Shelf 2 > Red Bin"
    bool IsCheckedOut
);

public record CreateToolRequest(
    string BarcodeId,
    string DisplayName,
    string? Description,
    string? HandwrittenId,
    string? UpcCode,
    string? PhotoUrl
);

public record UpdateToolRequest(
    string DisplayName,
    string? Description,
    string? HandwrittenId,
    string? UpcCode,
    string? PhotoUrl
);

public record PlaceToolRequest(int LocationId);

public record CheckinRequest(int LocationId);

// ── Sync ───────────────────────────────────────────────────────────────────

public enum OfflineActionType { Checkout, Checkin }

public record OfflineAction(
    string ActionId,          // client-generated UUID for idempotency
    OfflineActionType Type,
    string BarcodeId,
    string? LocationQrCode,   // required for Checkin
    DateTimeOffset OccurredAt
);

public record OfflineActionResult(
    string ActionId,
    bool Success,
    string? Error
);

public record SyncFlushRequest(List<OfflineAction> Actions);
public record SyncFlushResponse(List<OfflineActionResult> Results);

// ── CSV Import ─────────────────────────────────────────────────────────────

public record ImportRowResult(
    int Row,
    bool Success,
    string? ToolName,
    string? Error
);

public record ImportSummary(
    int Created,
    int Skipped,
    int Errors,
    List<ImportRowResult> Rows
);
