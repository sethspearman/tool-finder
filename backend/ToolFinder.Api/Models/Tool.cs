using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;

namespace ToolFinder.Api.Models;

public class Tool
{
    public int Id { get; set; }
    public string BarcodeId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? HandwrittenId { get; set; }
    public string? UpcCode { get; set; }
    public string? PhotoUrl { get; set; }

    public int? CurrentLocationId { get; set; }
    public Location? CurrentLocation { get; set; }
    public bool IsCheckedOut { get; set; }

    public NpgsqlTsVector? SearchVector { get; set; }

    public ICollection<CheckoutLog> CheckoutLogs { get; set; } = [];
}
