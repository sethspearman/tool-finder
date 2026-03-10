namespace ToolFinder.Api.Models;

public class Location
{
    public int Id { get; set; }
    public string QrCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? PhotoUrl { get; set; }

    public int? ParentLocationId { get; set; }
    public Location? ParentLocation { get; set; }
    public ICollection<Location> Children { get; set; } = [];
    public ICollection<Tool> Tools { get; set; } = [];
}
