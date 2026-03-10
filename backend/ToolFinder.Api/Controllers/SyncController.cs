using Microsoft.AspNetCore.Mvc;
using ToolFinder.Api.Models;
using ToolFinder.Api.Services;

namespace ToolFinder.Api.Controllers;

[ApiController]
[Route("sync")]
public class SyncController(SyncService syncService) : ControllerBase
{
    [HttpPost("flush")]
    public async Task<IActionResult> Flush([FromBody] SyncFlushRequest request) =>
        Ok(await syncService.FlushAsync(request));
}
