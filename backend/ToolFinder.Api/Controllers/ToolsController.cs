using Microsoft.AspNetCore.Mvc;
using ToolFinder.Api.Models;
using ToolFinder.Api.Services;

namespace ToolFinder.Api.Controllers;

[ApiController]
[Route("api/tools")]
public class ToolsController(ToolService toolService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await toolService.GetAllAsync());

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string q) =>
        Ok(await toolService.SearchAsync(q));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dto = await toolService.GetByIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("by-barcode/{barcode}")]
    public async Task<IActionResult> GetByBarcode(string barcode)
    {
        var dto = await toolService.GetByBarcodeAsync(barcode);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateToolRequest req)
    {
        var dto = await toolService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateToolRequest req)
    {
        var dto = await toolService.UpdateAsync(id, req);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await toolService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:int}/place")]
    public async Task<IActionResult> Place(int id, [FromBody] PlaceToolRequest req)
    {
        var dto = await toolService.PlaceAsync(id, req.LocationId);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("{id:int}/checkout")]
    public async Task<IActionResult> Checkout(int id)
    {
        var dto = await toolService.CheckoutAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("{id:int}/checkin")]
    public async Task<IActionResult> Checkin(int id, [FromBody] CheckinRequest req)
    {
        var dto = await toolService.CheckinAsync(id, req.LocationId);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("import")]
    public async Task<IActionResult> Import(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided");

        using var reader = new StreamReader(file.OpenReadStream());
        var csv = await reader.ReadToEndAsync();

        // Parse CSV manually (PapaParse is client-side; server uses simple split)
        var lines = csv.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        if (lines.Length < 2)
            return BadRequest("CSV must have a header row and at least one data row");

        var headers = lines[0].Split(',').Select(h => h.Trim().Trim('"')).ToArray();
        var rows = lines.Skip(1).Select(line =>
        {
            var values = line.Split(',').Select(v => v.Trim().Trim('"')).ToArray();
            return headers
                .Zip(values, (h, v) => (h, v))
                .ToDictionary(kv => kv.h, kv => kv.v);
        }).ToList();

        var summary = await toolService.BulkImportAsync(rows);
        return Ok(summary);
    }
}
