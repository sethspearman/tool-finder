using Microsoft.AspNetCore.Mvc;
using ToolFinder.Api.Models;
using ToolFinder.Api.Services;

namespace ToolFinder.Api.Controllers;

[ApiController]
[Route("api/locations")]
public class LocationsController(LocationService locationService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetTree() =>
        Ok(await locationService.GetTreeAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dto = await locationService.GetByIdAsync(id);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("by-qr/{qrCode}")]
    public async Task<IActionResult> GetByQr(string qrCode)
    {
        var dto = await locationService.GetByQrCodeAsync(qrCode);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLocationRequest req)
    {
        var dto = await locationService.CreateAsync(req);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLocationRequest req)
    {
        var dto = await locationService.UpdateAsync(id, req);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await locationService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    // QR label endpoints — SVG/PDF generation to be implemented
    [HttpGet("{id:int}/qr-label")]
    public IActionResult GetQrLabel(int id) =>
        StatusCode(501, "QR label generation not yet implemented");

    [HttpGet("qr-sheet")]
    public IActionResult GetQrSheet([FromQuery] string ids) =>
        StatusCode(501, "QR sheet generation not yet implemented");
}
