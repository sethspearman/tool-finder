namespace ToolFinder.Api.Models;

public class CheckoutLog
{
    public int Id { get; set; }
    public int ToolId { get; set; }
    public Tool Tool { get; set; } = null!;

    public DateTimeOffset CheckedOutAt { get; set; }
    public DateTimeOffset? CheckedInAt { get; set; }
    public int? ReturnedToLocationId { get; set; }
    public Location? ReturnedToLocation { get; set; }
}
