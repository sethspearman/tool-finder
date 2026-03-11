using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using ToolFinder.Api.Data;
using ToolFinder.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<LocationService>();
builder.Services.AddScoped<ToolService>();
builder.Services.AddScoped<SyncService>();
builder.Services.AddSingleton<LabelService>();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.SetIsOriginAllowed(origin =>
                  origin.StartsWith("http://localhost") ||
                  origin.EndsWith(".ts.net"))
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// Auto-apply migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
