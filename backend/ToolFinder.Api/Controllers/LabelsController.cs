using Microsoft.AspNetCore.Mvc;
using ToolFinder.Api.Services;

namespace ToolFinder.Api.Controllers;

[ApiController]
[Route("api/labels")]
public class LabelsController(LabelService labelService) : ControllerBase
{
    /// <summary>
    /// Generate a print-ready PDF sheet of blank labels.
    /// size: "small" = Avery 94102 (3/4"), "large" = Avery 94103 (1")
    /// </summary>
    [HttpPost("generate")]
    public IActionResult Generate([FromQuery] int count = 20, [FromQuery] string size = "large")
    {
        if (count < 1 || count > 500)
            return BadRequest("count must be between 1 and 500");

        var labelSize = size.ToLower() == "small" ? LabelSize.Small : LabelSize.Large;
        var (pdf, ids) = labelService.GenerateSheet(count, labelSize);

        Response.Headers["X-Generated-Ids"] = string.Join(",", ids);
        return File(pdf, "application/pdf", $"tool-finder-labels-{DateTime.UtcNow:yyyyMMdd-HHmm}.pdf");
    }

    /// <summary>Single label for a known ID (e.g. reprint a lost label)</summary>
    [HttpGet("single")]
    public IActionResult Single([FromQuery] string id, [FromQuery] string size = "large")
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("id is required");

        var labelSize = size.ToLower() == "small" ? LabelSize.Small : LabelSize.Large;
        var pdf = labelService.GenerateSingleLabel(id.ToUpper(), labelSize);
        return File(pdf, "application/pdf", $"label-{id}.pdf");
    }
}
